import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, required: true },
  isRead: { type: Boolean, default: false },
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

ContactMessageSchema.virtual('id').get(function() {
  return this._id.toString();
});

const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
export default ContactMessage;
