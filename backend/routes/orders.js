
import express from 'express';
import nodemailer from 'nodemailer';
import OrderModel from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/authMiddleware.js';
import { trackGA4Event, trackMetaCAPI } from '../utils/tracking.js';
import { sendTelegramOrderNotification } from '../utils/telegram.js';

const router = express.Router();

// Dynamic settings-aware SMTP Transporter Creator
const sendOrderEmailToAdmin = async (order) => {
  // Retrieve settings first to get SMTP details and recipient list
  let settings = null;
  try {
    settings = await Settings.findOne();
  } catch (err) {
    console.error("[Email Server] Error retrieving settings from database:", err);
  }

  // Determine dynamic sender email and name
  let smtpUser = process.env.GMAIL_USER;
  let smtpPass = process.env.GMAIL_PASS;
  let smtpHost = 'smtp.gmail.com';
  let smtpPort = 587;
  let smtpSecure = false;
  let smtpSenderName = 'SAZO | Order Desk';

  // Overwrite if database settings have SMTP configured
  const hasCustomSmtp = settings && settings.smtpUser && settings.smtpPass;
  if (hasCustomSmtp) {
    smtpUser = settings.smtpUser;
    smtpPass = settings.smtpPass;
    smtpHost = settings.smtpHost || 'smtp.gmail.com';
    smtpPort = Number(settings.smtpPort) || 587;
    smtpSecure = settings.smtpSecure ?? false;
    smtpSenderName = settings.smtpSenderName || 'SAZO | Order Desk';
  }

  if (!smtpUser || !smtpPass) {
    console.error("[Email Server] Warning: SMTP credentials not configured (neither database custom SMTP nor process.env.GMAIL_USER/GMAIL_PASS are set). Discarding email.");
    return false;
  }

  // Create transporter dynamically so it always reflects the latest credentials
  let transporter;
  try {
    const config = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    };
    
    // Auto-configure Gmail service if using default credentials
    if (smtpHost === 'smtp.gmail.com' && !hasCustomSmtp) {
      config.service = 'gmail';
    }

    transporter = nodemailer.createTransport(config);
  } catch (err) {
    console.error("[Email Server] Failed to build SMTP nodemailer transporter:", err);
    return false;
  }

  // Ensure notifications are delivered to all key addresses to prevent missing orders
  const recipientsSet = new Set();
  
  // 1. User's active operational emails
  recipientsSet.add('sazo.ceo@gmail.com');
  recipientsSet.add('sazo.system@gmail.com');
  
  // 2. Custom recipients from dynamic settings
  if (settings && settings.notificationRecipients) {
    settings.notificationRecipients.split(',').forEach(email => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed) recipientsSet.add(trimmed);
    });
  }

  // 3. Configured adminEmail in database (unless it is a placeholder)
  if (settings && settings.adminEmail && settings.adminEmail.toLowerCase().trim() !== 'admin@sazo.com') {
    recipientsSet.add(settings.adminEmail.toLowerCase().trim());
  }

  // 4. System sender email so the owner can find it in their inbox/sent
  if (smtpUser) {
    recipientsSet.add(smtpUser.toLowerCase().trim());
  }

  const recipients = Array.from(recipientsSet).join(', ');
  console.log(`[Email Server] Dispatching Order #${order.orderId} notification via ${smtpHost}:${smtpPort} to: ${recipients}`);

  const productsSubtotal = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCharge = order.shippingCharge || 0;
  const discountAmount = order.discountAmount || 0;
  const grandTotal = order.total;

  const itemsHtml = order.cartItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;"><img src="${item.image}" width="50" style="border-radius: 4px;" /></td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
        <div style="font-size: 12px; color: #666;">${item.size ? `Size: ${item.size} | ` : ''}Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">৳${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`).join('');

  const mailOptions = {
    from: `"${smtpSenderName}" <${smtpUser}>`,
    to: recipients,
    subject: `🥂 New Acquisition #${order.orderId}`,
    priority: 'high',
    html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; border: 1px solid #f5f5f5; border-radius: 40px; overflow: hidden; background-color: #fff; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
      <div style="background: #1c1917; padding: 40px; color: white; text-align: center;">
        <h1 style="margin:0; font-size: 28px; letter-spacing: 4px; font-weight: normal; font-style: italic;">SAZO</h1>
        <p style="margin:10px 0 0 0; opacity: 0.6; font-size: 10px; text-transform: uppercase; letter-spacing: 3px;">Order Dispatch #${order.orderId}</p>
      </div>
      <div style="padding: 40px;">
        <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f5f5f5;">
            <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #a8a29e; font-weight: bold; margin-bottom: 15px;">Customer Dossier</p>
            <p style="line-height: 2; color: #1c1917; font-size: 14px; margin: 0;">
                <strong>Identity:</strong> ${order.firstName}<br>
                <strong>Contact:</strong> ${order.phone}<br>
                <strong>Destination:</strong> ${order.address}<br>
                <strong>District:</strong> ${order.city || 'Standard'}<br>
                <strong>Settlement:</strong> ${order.paymentMethod === 'Online' ? 'Verified Advance' : 'Traditional C.O.D'}<br>
                ${order.note ? `<strong>Instruction:</strong> <i style="color: #78716c;">${order.note}</i>` : ''}
            </p>
        </div>
        
        <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #a8a29e; font-weight: bold; margin-bottom: 15px;">Acquired Pieces</p>
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">${itemsHtml}</table>
        
        <div style="padding: 30px; background: #fcf8f6; border-radius: 24px; border: 1px solid #fff1f2;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
            <span>Subtotal</span>
            <span>৳${productsSubtotal.toLocaleString()}</span>
          </div>
          ${discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #fb7185; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
            <span>Privilege Bonus</span>
            <span>-৳${discountAmount.toLocaleString()}</span>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
            <span>Logistics</span>
            <span>৳${shippingCharge.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #1c1917; border-top: 1px solid #fff1f2; padding-top: 15px; font-style: italic;">
            <span>Manifest Total</span>
            <span>৳${grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div style="background: #fdfdfd; padding: 30px; text-align: center; color: #a8a29e; font-size: 9px; text-transform: uppercase; letter-spacing: 2px;">
        SAZO ATELIER &copy; 2026 | Artisan E-commerce
      </div>
    </div>`
  };
  try { 
    await transporter.sendMail(mailOptions); 
    console.log(`[Email Server] Order notification email sent successfully to: ${recipients}`);
    return true; 
  } catch (e) { 
    console.error("[Email Server] Critical SMTP error sending order notification email:", e);
    return false; 
  }
};

// @desc    Get dashboard stats (Now with Real Unique Customer Count)
router.get('/stats', protect, async (req, res) => {
    try {
        if (!req.dbConnected) {
            return res.json({ 
                totalOrders: 0, 
                onlineTransactions: 0, 
                totalRevenue: 0, 
                totalProducts: 4,
                outOfStockCount: 0,
                fashionRevenue: 0,
                cosmeticsRevenue: 0,
                fashionOrders: 0,
                cosmeticsOrders: 0,
                customerCount: 0
            });
        }
        const totalOrders = await OrderModel.countDocuments();
        const onlineTransactions = await OrderModel.countDocuments({ paymentMethod: 'Online' });
        const totalProducts = await Product.countDocuments();
        const outOfStockCount = await Product.countDocuments({ isOutOfStock: true });

        // Functional: Unique Customer Count based on Phone numbers
        const uniqueCustomers = await OrderModel.distinct('phone');
        const customerCount = uniqueCustomers.length;

        // Aggregate for Category-wise Revenue
        const categoryResult = await OrderModel.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$cartItems' },
            { $lookup: {
                from: 'products',
                let: { pId: '$cartItems.id' },
                pipeline: [
                    { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$pId"] } } },
                    { $project: { category: 1 } }
                ],
                as: 'productInfo'
            }},
            { $addFields: { 
                itemCategory: { $ifNull: [{ $arrayElemAt: ["$productInfo.category", 0] }, "Other"] } 
            }},
            { $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ['$cartItems.price', '$cartItems.quantity'] } },
                cosmeticsRevenue: { $sum: { $cond: [{ $eq: ["$itemCategory", "Cosmetics"] }, { $multiply: ['$cartItems.price', '$cartItems.quantity'] }, 0] } },
                fashionRevenue: { $sum: { $cond: [{ $ne: ["$itemCategory", "Cosmetics"] }, { $multiply: ['$cartItems.price', '$cartItems.quantity'] }, 0] } }
            }}
        ]);

        const cosmeticsOrders = await OrderModel.countDocuments({ 'cartItems.name': { $regex: /cosmetic|beauty|serum|lip/i } });
        
        const stats = categoryResult[0] || { totalRevenue: 0, cosmeticsRevenue: 0, fashionRevenue: 0 };

        res.json({ 
            totalOrders, 
            onlineTransactions, 
            totalRevenue: stats.totalRevenue, 
            totalProducts,
            outOfStockCount,
            fashionRevenue: stats.fashionRevenue,
            cosmeticsRevenue: stats.cosmeticsRevenue,
            fashionOrders: totalOrders - cosmeticsOrders,
            cosmeticsOrders: cosmeticsOrders,
            customerCount: customerCount // Now sending real unique count
        });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Server Error' }); 
    }
});

router.get('/', protect, async (req, res) => {
  try {
    if (!req.dbConnected) return res.json([]);
    const orders = await OrderModel.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    let order;
    if (/^\d{5,7}$/.test(req.params.id)) { order = await OrderModel.findOne({ orderId: req.params.id }); }
    else { order = await OrderModel.findById(req.params.id); }
    if (order) res.json(order);
    else res.status(404).json({ message: 'Order not found' });
  } catch (error) { res.status(404).json({ message: 'Order not found' }); }
});

router.post('/', async (req, res) => {
  try {
    if (!req.dbConnected) {
        return res.status(503).json({ message: 'Database connection temporarily unavailable. Please try again in few minutes.' });
    }
    const { customerDetails, cartItems, total, paymentInfo, shippingCharge, discountAmount, couponCode } = req.body;
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    let uniqueId;
    let isUnique = false;
    while (!isUnique) {
        uniqueId = Math.floor(10000 + Math.random() * 9989999).toString();
        const existing = await OrderModel.findOne({ orderId: uniqueId });
        if (!existing) isUnique = true;
    }
    const order = new OrderModel({
        orderId: uniqueId,
        firstName: customerDetails?.firstName || 'Customer',
        lastName: customerDetails?.lastName || '',
        email: customerDetails?.email || 'no-email@provided.com',
        phone: customerDetails?.phone || '',
        address: customerDetails?.address || '',
        city: customerDetails?.city || '',
        note: customerDetails?.note || '',
        cartItems,
        total,
        shippingCharge: shippingCharge || 0,
        discountAmount: discountAmount || 0,
        couponCode: couponCode || '',
        paymentMethod: (paymentInfo?.paymentMethod === 'Online' || paymentInfo?.paymentMethod === 'COD') ? paymentInfo.paymentMethod : 'COD',
        paymentDetails: paymentInfo?.paymentDetails,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
    });
    const createdOrder = await order.save();
    
    // Fetch site settings once for tracking and notifications
    let settings = null;
    try {
        settings = await Settings.findOne();
    } catch (err) {
        console.error("Settings fetch error:", err.message);
    }

    // Server-Side Tracking for Purchase
    try {
        if (settings) {
            const gaClientId = req.body.gaClientId; // Passed from frontend
            const gaItems = cartItems.map(item => ({
                item_id: item.productId || item.id,
                item_name: item.name,
                currency: 'BDT',
                price: item.price,
                quantity: item.quantity,
                item_variant: item.size
            }));

            trackGA4Event('Purchase', {
                transaction_id: createdOrder.orderId,
                value: total,
                currency: 'BDT',
                shipping: shippingCharge,
                items: gaItems
            }, gaClientId, {
                gaMeasurementId: settings?.gaMeasurementId,
                gaApiSecret: settings?.gaApiSecret
            }).catch(e => console.log("GA4 Tracking error:", e.message));

            // Meta CAPI Tracking
            const fbc = req.cookies?._fbc || req.cookies?.fbc || null;
            const fbp = req.cookies?._fbp || req.cookies?.fbp || null;
            const userAgent = req.headers['user-agent'];
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            // Split name for Meta
            const nameParts = (customerDetails?.firstName || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

            trackMetaCAPI('Purchase', {
                transaction_id: createdOrder.orderId,
                value: total,
                currency: 'BDT',
                shipping: shippingCharge,
                content_ids: cartItems.map(i => i.productId || i.id),
                num_items: cartItems.length
            }, {
                email: customerDetails.email || '',
                phone: customerDetails.phone || '',
                firstName,
                lastName,
                city: customerDetails.city || '',
                country: 'Bangladesh',
                external_id: gaClientId,
                ip,
                userAgent,
                fbc,
                fbp
            }, {
                fbPixelId: settings?.fbPixelId,
                fbAccessToken: settings?.fbAccessToken,
                fbTestCode: settings?.fbTestCode
            }).catch(e => console.log("Meta CAPI error:", e.message));
        }
    } catch (err) {
        console.error("Tracking error:", err.message);
    }

    // Send Telegram Notification immediately & synchronously before ending HTTP response
    try {
        if (settings) {
            await sendTelegramOrderNotification(createdOrder, settings);
        } else {
            const freshSettings = await Settings.findOne();
            await sendTelegramOrderNotification(createdOrder, freshSettings);
        }
    } catch (e) {
        console.error("Telegram notification error:", e.message);
    }

    // Send Admin Email alert
    sendOrderEmailToAdmin(createdOrder).catch(e => console.log("Silent order email error:", e.message));

    res.status(201).json(createdOrder);
  } catch (error) { res.status(400).json({ message: 'Error creating order', error: error.message }); }
});

router.put('/:id/status', protect, async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (order) {
      order.status = req.body.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else { res.status(404).json({ message: 'Order not found' }); }
  } catch (error) { res.status(400).json({ message: 'Error updating order status' }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (order) { await order.deleteOne(); res.json({ message: 'Order removed' }); }
    else { res.status(404).json({ message: 'Order not found' }); }
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

export default router;
