
import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';
import { MOCK_PRODUCTS_DATA } from '../data/seedData.js';

const router = express.Router();

// @desc    Fetch paginated products for admin
// @route   GET /api/products/admin
// @access  Private/Admin
router.get('/admin', protect, async (req, res) => {
    try {
        if (!req.dbConnected) {
             return res.json({ products: [], page: 1, pages: 1, total: 0, message: 'Database disconnected' });
        }
        const pageSize = 20; // Number of products per page
        const page = Number(req.query.page) || 1;
        const searchTerm = req.query.search ? {
            name: {
                $regex: req.query.search,
                $options: 'i' // case-insensitive
            }
        } : {};

        const count = await Product.countDocuments({ ...searchTerm });
        const products = await Product.find({ ...searchTerm })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc    Fetch all products (Optimized for Shop Page)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    let products = [];
    if (req.dbConnected) {
        products = await Product.find({}, { images: { $slice: 1 } }).sort({ createdAt: -1 }).lean();
    }
    
    if (products.length === 0) {
        console.log('[API] Using mock data fallback for products list');
        products = MOCK_PRODUCTS_DATA;
    }

    const formattedProducts = products.map(p => {
        const id = p._id ? p._id.toString() : String(p.id);
        return { ...p, id };
    });

    res.json(formattedProducts);
  } catch (error) {
    console.error('[API] Products list error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Fetch single product by ID or ProductId
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let product;
    
    if (req.dbConnected) {
        // Priority 1: Search by productId (numeric string)
        // Relaxed check: Accept any non-empty string that isn't a 24-char ObjectId
        // This supports both the 6-digit generated IDs AND the 3-digit seed IDs (e.g. "109")
        product = await Product.findOne({ productId: req.params.id });
        
        // Priority 2: If not found, and it looks like a valid Mongo ObjectId, search by _id
        if (!product && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(req.params.id);
            
            // LAZY MIGRATION: If we found an old product without a productId, 
            // generate one now and save it.
            if (product && !product.productId) {
                // Generate random 6 digit number
                let uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
                // Ensure uniqueness check (simple loop)
                let exists = await Product.findOne({ productId: uniqueId });
                while(exists) {
                    uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
                    exists = await Product.findOne({ productId: uniqueId });
                }
                
                product.productId = uniqueId;
                await product.save();
            }
        }
    }

    // Fallback to mock data if DB is disconnected or product not found in DB
    if (!product) {
        product = MOCK_PRODUCTS_DATA.find(p => String(p.id) === req.params.id || String(p.productId) === req.params.id);
    }

    if (product) {
      // Ensure ID is a string for frontend consistency
      const productObj = product.toObject ? product.toObject() : product;
      const formattedProduct = {
          ...productObj,
          id: product._id ? product._id.toString() : String(product.id)
      };
      res.json(formattedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    // Final fallback to mock data on error too
    const fallbackProduct = MOCK_PRODUCTS_DATA.find(p => String(p.id) === req.params.id || String(p.productId) === req.params.id);
    if (fallbackProduct) {
        return res.json({
            ...fallbackProduct,
            id: fallbackProduct._id ? fallbackProduct._id.toString() : String(fallbackProduct.id)
        });
    }
    res.status(404).json({ message: 'Product not found' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
  try {
    // productId is now automatically generated by the Mongoose Schema default function
    // if it is not provided in req.body.
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Exclude the 'id' field from the request body if it exists
      const { id, productId, ...updateData } = req.body;
      Object.assign(product, updateData);
      
      // Ensure productId exists if it was missing (migration on update)
      if (!product.productId) {
           product.productId = Math.floor(100000 + Math.random() * 900000).toString();
      }
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
