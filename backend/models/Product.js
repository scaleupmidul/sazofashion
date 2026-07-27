
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productId: { 
    type: String, 
    unique: true, 
    // Automatically generate a 6-digit number if not provided
    default: function() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  regularPrice: { type: Number }, // Added: Regular/Old Price
  description: { type: String, required: true },
  fabric: { type: String, required: true },
  colors: [String],
  sizes: [String],
  isNewArrival: { type: Boolean, default: false },
  newArrivalDisplayOrder: { type: Number, default: 1000 },
  isTrending: { type: Boolean, default: false },
  trendingDisplayOrder: { type: Number, default: 1000 },
  onSale: { type: Boolean, default: false },
  isOutOfStock: { type: Boolean, default: false },
  images: [String],
  displayOrder: { type: Number, default: 1000 }, // Kept as fallback/general
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Add indexes for performance optimization
ProductSchema.index({ isNewArrival: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ newArrivalDisplayOrder: 1 });
ProductSchema.index({ trendingDisplayOrder: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ productId: 1 }); // Index for the new ID


const Product = mongoose.model('Product', ProductSchema);
export default Product;
