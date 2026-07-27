
import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  // Aligning with frontend CartItem type
  id: { type: String }, 
  productId: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  size: { type: String }, // Using size to match frontend types.ts
}, { _id: false });

const PaymentDetailsSchema = new mongoose.Schema({
  paymentNumber: String,
  method: String,
  amount: Number,
  transactionId: String,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true }, // 5-7 digit unique ID
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  email: { type: String, required: true, default: 'anonymous@example.com' },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: '' },
  note: { type: String, default: '' },
  cartItems: [CartItemSchema],
  total: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  date: { type: String, required: true },
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
  paymentDetails: PaymentDetailsSchema,
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

// To match the frontend's string-based ID, which was previously a timestamp.
OrderSchema.virtual('id').get(function() {
  return this._id.toString();
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
