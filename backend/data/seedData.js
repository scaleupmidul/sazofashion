
// Data copied from frontend constants.ts
export const MOCK_PRODUCTS_DATA = [
  { id: 101, name: "Midnight Rose Evening Gown", category: "Signature", price: 8500, description: "A breathtaking midnight rose evening gown handcrafted for the modern woman. Features intricate floral embroidery and a flowing silhouette.", fabric: "Premium Fabric", colors: ["Midnight Blue", "Crimson Red"], sizes: ["S", "M", "L", "XL"], isNewArrival: true, isTrending: true, onSale: false, images: [] },
  { id: 102, name: "Azure Breeze Cotton Kurti", category: "Traditional", price: 3200, description: "Stay cool and elegant in our Azure Breeze kurti. Made from premium breathable cotton with delicate block prints.", fabric: "100% Organic Cotton", colors: ["Azure Blue", "Peach"], sizes: ["M", "L", "XL"], isNewArrival: true, isTrending: true, onSale: false, images: [] },
  { id: 103, name: "Velvet Nights Luxury Wrap", category: "Lifestyle", price: 5400, description: "Make an entrance with this luxurious velvet wrap. Perfect for evening galas and sophisticated occasions.", fabric: "Premium Velvet", colors: ["Emerald Green", "Royal Black"], sizes: ["Free Size"], isNewArrival: false, isTrending: true, onSale: true, images: [] },
  { id: 104, name: "Summer Peony Linen Dress", category: "New Arrivals", price: 4200, description: "A lightweight linen dress featuring hand-painted peonies. Effortlessly chic for the summer season.", fabric: "Linen Blend", colors: ["Soft Pink", "Lavender"], sizes: ["XS", "S", "M"], isNewArrival: true, isTrending: false, onSale: false, images: [] },
  { id: 901, name: "[DEMO] Aurora Gold Ensemble", category: "Signature", price: 9500, description: "A limited edition aurora ensemble. This is a demo product for administrative testing.", fabric: "Fine Fabric", colors: ["Champagne"], sizes: ["S", "M", "L"], isNewArrival: true, isTrending: false, onSale: false, images: [] },
  { id: 902, name: "[DEMO] Crimson Velvet Evening", category: "Lifestyle", price: 7200, description: "A sophisticated crimson velvet evening dress. This is a demo product for administrative testing.", fabric: "Velvet", colors: ["Crimson"], sizes: ["M", "L"], isNewArrival: false, isTrending: true, onSale: true, regularPrice: 8500, images: [] },
  { id: 903, name: "[DEMO] Onyx Heritage Wear", category: "Signature", price: 15000, description: "A timeless onyx heritage wear with silver threadwork. This is a demo product for administrative testing.", fabric: "Heritage Fabric", colors: ["Onyx"], sizes: ["Standard"], isNewArrival: true, isTrending: true, onSale: false, images: [] },
  { id: 201, name: "Golden Aura Seasonal Wear", category: "Signature", price: 12500, description: "A masterpiece of traditional weaving, the Golden Aura ensemble features pure gold work on fine fabric.", fabric: "Signature Fabric", colors: ["Gold & Cream"], sizes: ["Standard"], isNewArrival: true, isTrending: true, onSale: false, images: [] },
  { id: 202, name: "Stellar Evening Clutch", category: "Accessories", price: 2800, description: "A shimmering clutch designed to complete your evening look. Fits all essentials with a detachable chain strap.", fabric: "Satin & Crystals", colors: ["Silver", "Rose Gold"], sizes: ["Compact"], isNewArrival: true, isTrending: false, onSale: false, images: [] },
];

export const DEFAULT_SETTINGS_DATA = {
  headerLogoType: 'text',
  headerLogoImage: '',
  headerLogoText: 'SAZO',
  headerLogoHeight: 60,
  headerLogoHeightMobile: 60,
  onlinePaymentInfo: 'অর্ডার কনফার্ম করতে ডেলিভারি চার্জ অগ্রিম প্রদান করুন —\n<b>01909285883 (Personal)</b>\nBkash / Nagad\nএবং নিচের তথ্যগুলো পূরণ করুন:',
  onlinePaymentInfoStyles: {
    fontSize: '0.875rem', 
  },
  codEnabled: true,
  onlinePaymentEnabled: true,
  onlinePaymentMethods: ['Bkash', 'Nagad', 'UPAY'],
  sliderImages: [
    { id: 1, title: "Summer Elegance", subtitle: "Discover the season's most refined collections.", color: "text-rose-50", image: "", mobileImage: "" },
    { id: 2, title: "Exclusive Series", subtitle: "Graceful patterns designed for your special moments.", color: "text-rose-100", image: "", mobileImage: "" },
    { id: 3, title: "Heritage Collection", subtitle: "Timeless traditions meet modern-day craftsmanship.", color: "text-rose-50", image: "", mobileImage: "" }
  ],
  categoryImages: [
    { categoryName: "Signature", image: "" },
    { categoryName: "Traditional", image: "" },
    { categoryName: "Lifestyle", image: "" },
    { categoryName: "New Arrivals", image: "" }
  ],
  categories: ["Signature", "Traditional", "Lifestyle", "New Arrivals", "Accessories"],
  shippingOptions: [],
  sizeGuide: [
    { size: 'S', chest: '36', waist: '30', length: '40' },
    { size: 'M', chest: '38', waist: '32', length: '41' },
    { size: 'L', chest: '40', waist: '34', length: '42' },
    { size: 'XL', chest: '42', waist: '36', length: '43' },
  ],
  contactAddress: 'Road 27, Banani R/A, Dhaka, Bangladesh',
  contactPhone: '+880 1909 XXX XXX',
  contactEmail: 'hello@sazo.com',
  whatsappNumber: '+8801909285883',
  showWhatsAppButton: true,
  showCityField: true,
  socialMediaLinks: [
    { platform: 'Facebook', url: '#' },
    { platform: 'Instagram', url: '#' },
    { platform: 'Twitter', url: '#' },
  ],
  privacyPolicy: `
1. Introduction
Welcome to SAZO. We are committed to protecting your privacy...
  `.trim(),
  adminEmail: 'admin@sazo.com',
  adminPassword: 'sazo_admin_2026',
  footerDescription: 'SAZO is your premier destination for high-end Women\'s fashion. We curate exclusive collections that blend traditional heritage with modern elegance.',
  homepageNewArrivalsCount: 4,
  homepageTrendingCount: 4,
  showSliderText: true,
  signatureBanners: [
    {
        id: '1',
        header: 'PREMIUM COLLECTION',
        title: 'New Season Arrivals',
        description: 'Explore our latest curation of exquisite garments designed for the modern lifestyle.',
        buttonText: 'Discover Collection',
        link: '/shop',
        desktopImage: '',
        mobileImage: '',
        layout: 'landscape',
        shape: 'rectangle'
    },
    {
        id: '2',
        header: 'LIMITED EDITION',
        title: 'Timeless Elegance',
        description: 'Quality meets craftsmanship in every single piece of our exclusive range.',
        buttonText: 'Shop Now',
        link: '/shop',
        desktopImage: '',
        mobileImage: '',
        layout: 'portrait',
        shape: 'circle'
    }
  ],
  gaMeasurementId: '',
  gaApiSecret: '',
  fbPixelId: '',
  fbAccessToken: '',
  fbTestCode: '',
  gtmId: 'GTM-T7RFW3GJ',
  exitIntentPopupEnabled: false,
  exitIntentDiscount: 50,
  exitIntentCouponCode: 'SAZO50',
  brandVideoEnabled: true,
  brandVideoUrl: '',
  brandVideoMobileUrl: '',
  brandVideoTitle: 'Sazo Couture',
  brandVideoSubtitle: 'Behind The Craft',
  brandVideoPoster: '',
  brandVideoMobilePoster: ''
};
