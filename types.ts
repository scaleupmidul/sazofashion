
// types.ts
import type { Dispatch, SetStateAction } from 'react';

export interface Product {
  id: string;
  productId?: string;
  name: string;
  category: string;
  price: number;
  regularPrice?: number;
  description: string;
  fabric: string;
  colors: string[];
  sizes: string[];
  isNewArrival: boolean;
  newArrivalDisplayOrder?: number;
  isTrending: boolean;
  trendingDisplayOrder?: number;
  onSale: boolean;
  isOutOfStock?: boolean;
  images: string[];
  displayOrder: number;
}

export interface CartItem {
  id: string;
  productId?: string;
  name:string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderId: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  note?: string;
  cartItems: CartItem[];
  total: number;
  shippingCharge?: number;
  discountAmount?: number;
  couponCode?: string;
  status: OrderStatus;
  date: string;
  createdAt?: string;
  paymentMethod: 'COD' | 'Online';
  paymentDetails?: {
    paymentNumber: string;
    method: string;
    amount: number;
    transactionId: string;
  };
}

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface SliderImageSetting {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  image: string;
  mobileImage?: string;
}

export interface CategoryImageSetting {
  categoryName: string;
  image: string;
  subtitle?: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  charge: number;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface SizeGuideRow {
  size: string;
  chest: string;
  waist: string;
  length: string;
}

export interface SignatureBanner {
  id: string;
  header: string;
  title: string;
  description?: string;
  buttonText: string;
  link: string;
  desktopImage: string;
  mobileImage: string;
  layout?: 'landscape' | 'portrait' | 'square';
  shape?: 'rectangle' | 'rounded' | 'circle' | 'blob-1' | 'blob-2' | 'blob-3';
}

export interface AppSettings {
  headerLogoType?: 'text' | 'image';
  headerLogoImage?: string;
  headerLogoText?: string;
  headerLogoHeight?: number;
  headerLogoHeightMobile?: number;
  onlinePaymentInfo: string;
  onlinePaymentInfoStyles?: {
    fontSize: string;
  };
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  onlinePaymentMethods: string[];
  sliderImages: SliderImageSetting[];
  categoryImages: CategoryImageSetting[];
  categories: string[];
  pausedCategories?: string[];
  menuCategories?: string[];
  shippingOptions: ShippingOption[];
  sizeGuide: SizeGuideRow[];
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  showWhatsAppButton: boolean;
  socialMediaLinks: SocialMediaLink[];
  privacyPolicy: string;
  adminEmail: string;
  adminPassword: string;
  footerDescription: string;
  homepageNewArrivalsCount: number;
  homepageTrendingCount: number;
  showSliderText: boolean;
  signatureBanners: SignatureBanner[];
  signatureMobileDisplayMode?: 'both' | 'banner1' | 'banner2';
  gaMeasurementId?: string;
  gaApiSecret?: string;
  fbPixelId?: string;
  fbAccessToken?: string;
  fbTestCode?: string;
  gtmId?: string;
  exitIntentPopupEnabled: boolean;
  exitIntentDiscount: number;
  exitIntentCouponCode: string;
  freeShippingEnabled: boolean;
  contactMapEmbed?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpSenderName?: string;
  notificationRecipients?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  brandVideoEnabled?: boolean;
  brandVideoUrl?: string;
  brandVideoMobileUrl?: string;
  brandVideoTitle?: string;
  brandVideoSubtitle?: string;
  brandVideoPoster?: string;
  brandVideoMobilePoster?: string;
}

export interface AdminProductsPagination {
  page: number;
  pages: number;
  total: number;
}

export interface AdminProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

export interface DashboardStats {
    totalOrders: number;
    onlineTransactions: number;
    totalRevenue: number;
    totalProducts: number;
    outOfStockCount: number;
    fashionRevenue: number;
    cosmeticsRevenue: number;
    fashionOrders: number;
    cosmeticsOrders: number;
}

export interface AppState {
  path: string;
  navigate: (path: string, options?: { scroll?: boolean }) => void;
  products: Product[];
  orders: Order[];
  contactMessages: ContactMessage[];
  settings: AppSettings;
  cart: CartItem[];
  selectedProduct: Product | null;
  notification: Notification | null;
  loading: boolean;
  isAdminAuthenticated: boolean;
  cartTotal: number;
  fullProductsLoaded: boolean;
  adminProducts: Product[];
  adminProductsPagination: AdminProductsPagination;
  dashboardStats: DashboardStats | null;
  newOrdersCount: number;
  
  loadInitialData: () => Promise<void>;
  loadAdminData: () => Promise<void>;
  ensureAllProductsLoaded: () => Promise<void>;
  loadAdminProducts: (page: number, searchTerm: string) => Promise<void>;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  refreshProduct: (id: string) => Promise<void>;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  addToCart: (product: Product, quantity: number, size: string) => void;
  updateCartQuantity: (id: string, size: string, newQuantity: number) => void;
  clearCart: () => void;
  _updateCartTotal: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addProduct: (productData: any) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
  markOrdersAsSeen: () => void;
  addOrder: (customerDetails: any, cartItems: any[], total: number, paymentInfo: any, shippingCharge: number, discountAmount?: number, couponCode?: string) => Promise<Order>;
  deleteOrder: (orderId: string) => Promise<void>;
  addContactMessage: (messageData: any) => Promise<void>;
  markMessageAsRead: (messageId: string, isRead: boolean) => Promise<void>;
  deleteContactMessage: (messageId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}
