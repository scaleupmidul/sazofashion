
import mongoose from 'mongoose';

const SliderImageSchema = new mongoose.Schema({
  id: Number,
  title: String,
  subtitle: String,
  color: String,
  image: String,
  mobileImage: String,
}, { _id: false });

const CategoryImageSchema = new mongoose.Schema({
  categoryName: String,
  image: String,
}, { _id: false });

const ShippingOptionSchema = new mongoose.Schema({
  id: String,
  label: String,
  charge: Number,
}, { _id: false });

const SocialMediaLinkSchema = new mongoose.Schema({
  platform: String,
  url: String,
}, { _id: false });

const SizeGuideRowSchema = new mongoose.Schema({
  size: String,
  chest: String,
  waist: String,
  length: String,
}, { _id: false });

const SignatureBannerSchema = new mongoose.Schema({
  id: String,
  header: String,
  title: String,
  description: String,
  buttonText: String,
  link: String,
  desktopImage: String,
  mobileImage: String,
  layout: { type: String, default: 'landscape' },
  shape: { type: String, default: 'rectangle' },
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  // Header Logo settings
  headerLogoType: { type: String, default: 'text', enum: ['text', 'image'] },
  headerLogoImage: { type: String, default: '' },
  headerLogoText: { type: String, default: 'SAZO' },
  headerLogoHeight: { type: Number, default: 60 },
  headerLogoHeightMobile: { type: Number, default: 60 },
  onlinePaymentInfo: String,
  onlinePaymentInfoStyles: {
    fontSize: String,
  },
  codEnabled: Boolean,
  onlinePaymentEnabled: Boolean,
  onlinePaymentMethods: [String],
  sliderImages: [SliderImageSchema],
  categoryImages: [CategoryImageSchema],
  categories: [String],
  pausedCategories: [String],
  menuCategories: [String],
  shippingOptions: [ShippingOptionSchema],
  sizeGuide: [SizeGuideRowSchema],
  contactAddress: String,
  contactPhone: String,
  contactEmail: String,
  footerEmail: String,
  whatsappNumber: String,
  showWhatsAppButton: Boolean,
  showCityField: Boolean,
  socialMediaLinks: [SocialMediaLinkSchema],
  privacyPolicy: String,
  adminEmail: { type: String, required: true, unique: true },
  adminPassword: { type: String, required: true },
  adminPasswordPlain: { type: String, default: 'sazo_admin_2026' },
  footerDescription: String,
  homepageNewArrivalsCount: { type: Number, default: 4 },
  homepageTrendingCount: { type: Number, default: 4 },
  showSliderText: { type: Boolean, default: true },
  // Signature Collections Settings
  signatureBanners: [SignatureBannerSchema],
  signatureMobileDisplayMode: { type: String, default: 'both', enum: ['both', 'banner1', 'banner2'] },
  // Google Analytics 4 (Measurement Protocol)
  gaMeasurementId: { type: String, default: '' },
  gaApiSecret: { type: String, default: '' },
  // Meta Pixel Tracking (CAPI)
  fbPixelId: { type: String, default: '' },
  fbAccessToken: { type: String, default: '' },
  fbTestCode: { type: String, default: '' },
  gtmId: { type: String, default: '' },
  exitIntentPopupEnabled: { type: Boolean, default: false },
  exitIntentDiscount: { type: Number, default: 60 },
  exitIntentCouponCode: { type: String, default: 'SAVE60' },
  freeShippingEnabled: { type: Boolean, default: false },
  // Brand Video Settings
  brandVideoEnabled: { type: Boolean, default: true },
  brandVideoUrl: { type: String, default: '' },
  brandVideoTitle: { type: String, default: 'Sazo Couture' },
  brandVideoSubtitle: { type: String, default: 'Behind The Craft' },
  brandVideoPoster: { type: String, default: '' },
  brandVideoMobilePoster: { type: String, default: '' },
  // SMTP Configuration for order & message notifications
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpSecure: { type: Boolean, default: false },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  smtpSenderName: { type: String, default: 'SAZO' },
  notificationRecipients: { type: String, default: '' },
  telegramBotToken: { type: String, default: '' },
  telegramChatId: { type: String, default: '' },
  telegramEnabled: { type: Boolean, default: true }
});

const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;
