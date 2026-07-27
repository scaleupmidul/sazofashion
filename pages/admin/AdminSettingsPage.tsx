
import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store';
import { 
    Save, LoaderCircle, Plus, Trash2, CheckCircle, Monitor, 
    Smartphone, Tag, CreditCard, Layout, Image as ImageIcon, 
    MessageSquare, Shield, X, Share2, Facebook, Instagram, 
    Twitter, Youtube, ExternalLink, Settings as SettingsIcon, Gift, Truck,
    Type, Percent, Palette, Move, AlertTriangle, HelpCircle,
    ShoppingBag, Info, Sparkles, Layers, Eye, EyeOff, SmartphoneNfc,
    Globe, PhoneCall, MapPin, MousePointer2, AlignLeft,
    Check, ChevronRight, FileText, Lock, User, ShieldCheck, PlusCircle, Mail
} from 'lucide-react';
import { SliderImageSetting, ShippingOption, SocialMediaLink, AppSettings, CategoryImageSetting, SignatureBanner } from '../../types';
import SafeImage from '../../components/SafeImage';

// -------------------------------------------------------------------------
// UTILITY: Image Processing
// -------------------------------------------------------------------------
const compressImage = (file: File, options: { maxWidth: number; quality: number }): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const { maxWidth, quality } = options;
            let { width, height } = img;
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                const maxHeight = maxWidth; 
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Failed to get canvas context');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
    });
};

// -------------------------------------------------------------------------
// REUSABLE SUB-COMPONENTS (Compact UI)
// -------------------------------------------------------------------------

interface ImageInputProps {
    currentImage: string;
    onImageChange: (value: string) => void;
    options: { maxWidth: number; quality: number };
    label?: string;
    description?: string;
}

const ImageAssetInput: React.FC<ImageInputProps> = ({ currentImage, onImageChange, options, label, description }) => {
    const { notify } = useAppStore();
    const [inputType, setInputType] = useState<'upload' | 'url'>('url');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Strict control: ensure we always have a string
    const safeImageValue = currentImage || '';
    
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
             notify('File too large (Max 15MB).', 'error');
             return;
        }
        setIsProcessing(true);
        try {
            const result = await compressImage(file, options);
            onImageChange(result);
        } catch (error) {
            notify('Error processing image.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const safeDisplayValue = safeImageValue.startsWith('data:') ? '' : safeImageValue;
    
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                {label && <label className="text-xs font-bold text-stone-500 uppercase tracking-tight">{label}</label>}
                <div className="flex bg-stone-100 p-0.5 rounded-none font-admin">
                    <button type="button" onClick={() => setInputType('upload')} className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-none transition-all ${inputType === 'upload' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500'}`}>Upload</button>
                    <button type="button" onClick={() => setInputType('url')} className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-none transition-all ${inputType === 'url' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500'}`}>URL</button>
                </div>
            </div>
            
            <div className="relative group/asset">
                {inputType === 'upload' ? (
                    <div className="flex items-center gap-2 p-2.5 bg-stone-50 border border-dashed border-stone-200 rounded-none hover:border-stone-400 transition-colors cursor-pointer relative overflow-hidden">
                        <input type="file" onChange={handleFileSelect} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <ImageIcon className="w-4 h-4 text-stone-400" />
                        <span className="text-xs font-semibold text-stone-500 truncate font-admin">{safeImageValue ? 'Asset Selected' : 'Choose Local...'}</span>
                        {isProcessing && <LoaderCircle className="w-3 h-3 animate-spin text-stone-900 ml-auto" />}
                    </div>
                ) : (
                    <div className="relative">
                        <input 
                            type="text" 
                            value={safeDisplayValue} 
                            onChange={(e) => onImageChange(e.target.value)} 
                            placeholder="https://..." 
                            className="w-full p-2 pl-8 border border-stone-200 rounded-none text-xs bg-white text-stone-900 focus:border-stone-900 outline-none shadow-sm font-admin" 
                        />
                        <ExternalLink className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300" />
                    </div>
                )}
                
                {safeImageValue && (
                    <div className="mt-2 relative rounded-none overflow-hidden group/prev border border-stone-100 shadow-sm w-20 h-20">
                        <SafeImage src={safeImageValue} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={() => onImageChange('')} className="absolute inset-0 bg-black/40 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            {description && <p className="text-[10px] text-stone-400">{description}</p>}
        </div>
    );
};


const CompactSectionHeader: React.FC<{ icon: React.ElementType, title: string, sub: string }> = ({ icon: Icon, title, sub }) => (
    <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4 font-admin">
        <div className="p-2 bg-stone-100 rounded-none"><Icon className="w-5 h-5 text-stone-900" /></div>
        <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-tight">{title}</h3>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-tight">{sub}</p>
        </div>
    </div>
);

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-xs font-black text-stone-500 uppercase tracking-tight ml-1 mb-1 block font-admin">
        {children}
    </label>
);

const ProfessionalInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    const { value, ...rest } = props;
    return (
        <input 
            {...rest} 
            value={value ?? ''}
            className={`w-full p-3 bg-stone-50 border border-stone-100 rounded-none text-sm text-stone-900 focus:border-black focus:ring-4 focus:ring-stone-950/5 transition-all outline-none animate-fadeIn placeholder:text-stone-300 font-bold font-admin ${props.className || ''}`}
        />
    );
};

const ProfessionalTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const { value, ...rest } = props;
    return (
        <textarea 
            {...rest} 
            value={value ?? ''}
            className={`w-full p-4 bg-stone-50 border border-stone-100 rounded-none text-sm text-stone-900 focus:border-black focus:ring-4 focus:ring-stone-950/5 transition-all outline-none animate-fadeIn placeholder:text-stone-300 font-medium font-admin ${props.className || ''}`}
        />
    );
};

// -------------------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------------------

const AdminSettingsPage: React.FC = () => {
    const { settings, updateSettings, notify } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('categories');
    const [confirmSyncText, setConfirmSyncText] = useState('');

    // Password visibility states
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // --- Detailed States for all AppSettings properties ---
    
    // Authentication
    const [adminEmail, setAdminEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // SMTP Outbound Configurations
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState(587);
    const [smtpSecure, setSmtpSecure] = useState(false);
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [smtpSenderName, setSmtpSenderName] = useState('SAZO');
    const [notificationRecipients, setNotificationRecipients] = useState('');
    const [showSmtpPass, setShowSmtpPass] = useState(false);

    // Telegram Bot Instant Notifications
    const [telegramBotToken, setTelegramBotToken] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const [telegramEnabled, setTelegramEnabled] = useState(true);
    const [showTelegramToken, setShowTelegramToken] = useState(false);
    const [isTestingTelegram, setIsTestingTelegram] = useState(false);
    const [showTelegramGuide, setShowTelegramGuide] = useState(false);

    // --- Safety Logic: Only require confirmation if password fields have content ---
    const isPasswordModified = newPassword.length > 0 || confirmNewPassword.length > 0;
    const isSecurityTab = activeTab === 'general';
    const isConfirmationRequired = isSecurityTab && isPasswordModified;
    const isConfirmationValid = !isConfirmationRequired || confirmSyncText === 'CONFIRM';
    
    // Header Logo & Branding
    const [headerLogoType, setHeaderLogoType] = useState<'text' | 'image'>('text');
    const [headerLogoImage, setHeaderLogoImage] = useState('');
    const [headerLogoText, setHeaderLogoText] = useState('SAZO');
    const [headerLogoHeight, setHeaderLogoHeight] = useState(60); // PC / Laptop
    const [headerLogoHeightMobile, setHeaderLogoHeightMobile] = useState(60); // Phone / Mobile

    // Category Structure
    const [categoriesList, setCategoriesList] = useState<string[]>([]);
    const [pausedCategoriesList, setPausedCategoriesList] = useState<string[]>([]);
    const [menuCategoriesList, setMenuCategoriesList] = useState<string[]>([]);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryImages, setCategoryImages] = useState<CategoryImageSetting[]>([]);
    
    // Payment Systems
    const [onlinePaymentInfo, setOnlinePaymentInfo] = useState('');
    const [onlinePaymentFontSize, setOnlinePaymentFontSize] = useState('0.875rem');
    const [codEnabled, setCodEnabled] = useState(true);
    const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
    const [onlinePaymentMethodsText, setOnlinePaymentMethodsText] = useState('');
    
    // Logistics
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    
    // Hero Components
    const [sliderImages, setSliderImages] = useState<SliderImageSetting[]>([]);
    const [homepageNewArrivalsCount, setHomepageNewArrivalsCount] = useState(4);
    const [homepageTrendingCount, setHomepageTrendingCount] = useState(4);
    const [showSliderText, setShowSliderText] = useState(true);
    
    // Static Content
    const [footerDescription, setFooterDescription] = useState('');
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [contactAddress, setContactAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [footerEmail, setFooterEmail] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [showWhatsAppButton, setShowWhatsAppButton] = useState(true);

    // Size Guide
    const [sizeGuide, setSizeGuide] = useState<any[]>([]);

    // Campaign Banners
    const [signatureBanners, setSignatureBanners] = useState<SignatureBanner[]>([]);
    const [signatureMobileDisplayMode, setSignatureMobileDisplayMode] = useState<'both' | 'banner1' | 'banner2'>('both');

    // Tracking
    const [gaMeasurementId, setGaMeasurementId] = useState('');
    const [gaApiSecret, setGaApiSecret] = useState('');
    const [fbPixelId, setFbPixelId] = useState('');
    const [fbAccessToken, setFbAccessToken] = useState('');
    const [fbTestCode, setFbTestCode] = useState('');
    const [gtmId, setGtmId] = useState('');
    const [exitIntentPopupEnabled, setExitIntentPopupEnabled] = useState(false);
    const [exitIntentDiscount, setExitIntentDiscount] = useState(60);
    const [exitIntentCouponCode, setExitIntentCouponCode] = useState('SAVE60');
    const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
    const [contactMapEmbed, setContactMapEmbed] = useState('');

    // Brand Video
    const [brandVideoEnabled, setBrandVideoEnabled] = useState(true);
    const [brandVideoUrl, setBrandVideoUrl] = useState('');
    const [brandVideoMobileUrl, setBrandVideoMobileUrl] = useState('');
    const [brandVideoTitle, setBrandVideoTitle] = useState('');
    const [brandVideoSubtitle, setBrandVideoSubtitle] = useState('');
    const [brandVideoPoster, setBrandVideoPoster] = useState('');
    const [brandVideoMobilePoster, setBrandVideoMobilePoster] = useState('');

    // Initialize state from store
    useEffect(() => {
        if (settings) {
            setHeaderLogoType('image');
            setHeaderLogoImage(settings.headerLogoImage || '');
            setHeaderLogoText('');
            setHeaderLogoHeight(settings.headerLogoHeight || 60);
            setHeaderLogoHeightMobile(settings.headerLogoHeightMobile || 60);
            setAdminEmail(settings.adminEmail || '');
            const cats = settings.categories || [];
            const catImgs = settings.categoryImages || [];
            const syncedCatImgs = cats.map((cat: string) => {
                const found = catImgs.find((ci: any) => ci.categoryName && ci.categoryName.toLowerCase() === cat.toLowerCase());
                return { categoryName: cat, image: found ? found.image : '' };
            });
            setCategoriesList(cats);
            setCategoryImages(syncedCatImgs);
            const pausedCats = settings.pausedCategories || [];
            const menuCats = settings.menuCategories && settings.menuCategories.length > 0 ? settings.menuCategories : cats;
            setPausedCategoriesList(pausedCats);
            setMenuCategoriesList(menuCats);
            setOnlinePaymentInfo(settings.onlinePaymentInfo || '');
            setOnlinePaymentFontSize(settings.onlinePaymentInfoStyles?.fontSize || '0.875rem');
            setCodEnabled(settings.codEnabled ?? true);
            setOnlinePaymentEnabled(settings.onlinePaymentEnabled ?? true);
            setOnlinePaymentMethodsText(settings.onlinePaymentMethods?.join(', ') || '');
            setShippingOptions(settings.shippingOptions || []);
            setSliderImages(settings.sliderImages || []);
            setHomepageNewArrivalsCount(settings.homepageNewArrivalsCount || 4);
            setHomepageTrendingCount(settings.homepageTrendingCount || 4);
            setShowSliderText(settings.showSliderText ?? true);
            setFooterDescription(settings.footerDescription || '');
            setSocialMediaLinks(settings.socialMediaLinks || []);
            setPrivacyPolicy(settings.privacyPolicy || '');
            setContactAddress(settings.contactAddress || '');
            setContactPhone(settings.contactPhone || '');
            setContactEmail(settings.contactEmail || '');
            setFooterEmail(settings.footerEmail || '');
            setWhatsappNumber(settings.whatsappNumber || '');
            setShowWhatsAppButton(settings.showWhatsAppButton ?? true);
            setSizeGuide(settings.sizeGuide || []);
            
            setSignatureBanners(settings.signatureBanners || []);
            setSignatureMobileDisplayMode(settings.signatureMobileDisplayMode || 'both');

            setGaMeasurementId(settings.gaMeasurementId || '');
            setGaApiSecret(settings.gaApiSecret || '');
            setFbPixelId(settings.fbPixelId || '');
            setFbAccessToken(settings.fbAccessToken || '');
            setFbTestCode(settings.fbTestCode || '');
            setGtmId(settings.gtmId || '');
            setExitIntentPopupEnabled(settings.exitIntentPopupEnabled ?? false);
            setExitIntentDiscount(settings.exitIntentDiscount || 60);
            setExitIntentCouponCode(settings.exitIntentCouponCode || 'SAVE60');
            setFreeShippingEnabled(settings.freeShippingEnabled ?? false);
            setContactMapEmbed(settings.contactMapEmbed || '');

            setBrandVideoEnabled(settings.brandVideoEnabled ?? true);
            setBrandVideoUrl(settings.brandVideoUrl ?? '');
            setBrandVideoMobileUrl(settings.brandVideoMobileUrl ?? '');
            setBrandVideoTitle(settings.brandVideoTitle || 'Sazo Couture');
            setBrandVideoSubtitle(settings.brandVideoSubtitle || 'Behind The Craft');
            setBrandVideoPoster(settings.brandVideoPoster || '');
            setBrandVideoMobilePoster(settings.brandVideoMobilePoster || '');

            // Hydrate SMTP settings
            setSmtpHost(settings.smtpHost || '');
            setSmtpPort(settings.smtpPort || 587);
            setSmtpSecure(settings.smtpSecure ?? false);
            setSmtpUser(settings.smtpUser || '');
            setSmtpPass(settings.smtpPass || '');
            setSmtpSenderName(settings.smtpSenderName || 'SAZO');
            setNotificationRecipients(settings.notificationRecipients || '');

            // Hydrate Telegram settings
            setTelegramBotToken(settings.telegramBotToken || '');
            setTelegramChatId(settings.telegramChatId || '');
            setTelegramEnabled(settings.telegramEnabled ?? true);
        }
    }, [settings]);

    // --- Interaction Handlers ---

    // TAB SWITCHER WITH CLEANUP
    const handleTabSwitch = (tab: string) => {
        // If we are leaving the security tab, clear password states to prevent blockages on other tabs
        if (activeTab === 'general' && tab !== 'general') {
            setNewPassword('');
            setConfirmNewPassword('');
            setConfirmSyncText('');
            setShowNewPass(false);
            setShowConfirmPass(false);
        }
        setActiveTab(tab);
    };

    const handleAddCategory = () => {
        const val = newCategoryName.trim();
        if (!val) return;
        if (categoriesList.some(c => c.toLowerCase() === val.toLowerCase())) {
            notify("Category already exists.", "error");
            return;
        }
        setCategoriesList(prev => [...prev, val]);
        setMenuCategoriesList(prev => [...prev, val]); // enable in menu by default
        setCategoryImages(prev => {
            const exists = prev.some(ci => ci.categoryName && ci.categoryName.toLowerCase() === val.toLowerCase());
            if (exists) {
                return prev.map(ci => ci.categoryName && ci.categoryName.toLowerCase() === val.toLowerCase() ? { ...ci, categoryName: val } : ci);
            }
            return [...prev, { categoryName: val, image: '' }];
        });
        setNewCategoryName('');
    };

    const handleRemoveCategory = (name: string) => {
        setCategoryToDelete(name);
    };

    const confirmDeleteCategory = () => {
        if (!categoryToDelete) return;
        const name = categoryToDelete;
        setCategoriesList(p => p.filter(c => c !== name));
        setCategoryImages(p => p.filter(ci => ci.categoryName !== name));
        setPausedCategoriesList(p => p.filter(c => c !== name));
        setMenuCategoriesList(p => p.filter(c => c !== name));
        setCategoryToDelete(null);
        notify(`Removed "${name}" category.`, "info");
    };

    const handleAddSlide = () => {
        setSliderImages(prev => [...prev, { 
            id: Date.now(), 
            title: 'New Trend', 
            subtitle: 'Collection description...', 
            color: 'text-white', 
            image: '',
            mobileImage: '' 
        }]);
    };

    const handleAddShipping = () => {
        setShippingOptions(prev => [...prev, { id: Date.now().toString(), label: 'New Zone', charge: 0 }]);
    };

    const handleAddSignatureBanner = () => {
        setSignatureBanners(prev => [...prev, {
            id: Date.now().toString(),
            header: 'EXQUISITE TEXTURES',
            title: 'Timeless Collection Arrivals',
            description: 'Crafted for moments of pure grace...',
            buttonText: 'Discover Collection',
            link: '/shop',
            desktopImage: '',
            mobileImage: '',
            layout: 'landscape'
        }]);
    };

    const handleTestTelegram = async () => {
        if (!telegramBotToken.trim() || !telegramChatId.trim()) {
            notify("Please enter Bot Token and Chat ID first.", "error");
            return;
        }
        setIsTestingTelegram(true);
        try {
            const token = localStorage.getItem('unique_corner_admin_token');
            const res = await fetch('/api/settings/test-telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    botToken: telegramBotToken,
                    chatId: telegramChatId
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                notify("🔔 Test message sent! Check your Telegram phone app.", "success");
            } else {
                notify(data.message || "Failed to send test message.", "error");
            }
        } catch (err: any) {
            notify("Error testing Telegram: " + (err.message || "Connection error"), "error");
        } finally {
            setIsTestingTelegram(false);
        }
    };

    const handleSave = async () => {
        // Validation: ONLY check password match and confirm text if password is actually being changed
        if (isSecurityTab && isPasswordModified) {
            if (newPassword !== confirmNewPassword) {
                notify("Passwords do not match.", "error");
                return;
            }
            if (confirmSyncText !== 'CONFIRM') {
                notify("Please type CONFIRM to push sensitive updates.", "error");
                return;
            }
        }
        
        setIsSaving(true);
        try {
            await updateSettings({
                headerLogoType: 'image',
                headerLogoImage,
                headerLogoText: '',
                headerLogoHeight,
                headerLogoHeightMobile,
                adminEmail, 
                adminPassword: (isSecurityTab && isPasswordModified) ? newPassword : undefined,
                categories: categoriesList, 
                categoryImages,
                pausedCategories: pausedCategoriesList,
                menuCategories: menuCategoriesList,
                onlinePaymentInfo, onlinePaymentInfoStyles: { fontSize: onlinePaymentFontSize },
                codEnabled, onlinePaymentEnabled,
                onlinePaymentMethods: onlinePaymentMethodsText.split(',').map(m => m.trim()).filter(Boolean),
                shippingOptions, sliderImages, homepageNewArrivalsCount, homepageTrendingCount, showSliderText,
                footerDescription, socialMediaLinks, privacyPolicy, contactAddress, contactPhone, contactEmail, footerEmail,
                whatsappNumber, showWhatsAppButton,
                sizeGuide,
                signatureBanners: signatureBanners,
                signatureMobileDisplayMode,
                gaMeasurementId, gaApiSecret,
                fbPixelId, fbAccessToken, fbTestCode,
                gtmId,
                exitIntentPopupEnabled,
                exitIntentDiscount,
                exitIntentCouponCode,
                freeShippingEnabled,
                contactMapEmbed,
                brandVideoEnabled,
                brandVideoUrl,
                brandVideoMobileUrl,
                brandVideoTitle,
                brandVideoSubtitle,
                brandVideoPoster,
                brandVideoMobilePoster,
                smtpHost,
                smtpPort,
                smtpSecure,
                smtpUser,
                smtpPass,
                smtpSenderName,
                notificationRecipients,
                telegramBotToken,
                telegramChatId,
                telegramEnabled
            });
            setIsSaved(true);
            setConfirmSyncText('');
            setTimeout(() => setIsSaved(false), 2000);
            setNewPassword(''); setConfirmNewPassword('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Tab Rendering Logic (All detail fields included) ---

    const renderTabContent = () => {
        const cardClass = "bg-white p-5 sm:p-10 rounded-none border border-stone-100 shadow-[0_30px_80px_rgba(0,0,0,0.01)] animate-fadeIn space-y-8 sm:space-y-12 font-admin";

        switch (activeTab) {
            case 'headerLogo': return (
                <div className={cardClass}>
                    <CompactSectionHeader icon={ImageIcon} title="Header Logo & Branding" sub="Configure Header Logo image asset and dimensions" />
                    
                    {/* Image Logo Options */}
                    <div className="space-y-6 font-admin">
                        <ImageAssetInput 
                            label="Header Logo Image Asset"
                            description="Upload a transparent PNG, SVG, or WebP image, or provide a direct image link."
                            currentImage={headerLogoImage}
                            onImageChange={val => setHeaderLogoImage(val)}
                            options={{ maxWidth: 800, quality: 0.9 }}
                        />

                        {/* Logo Height Controls: Separate for PC and Mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            {/* PC / Desktop Height */}
                            <div className="space-y-3 p-5 bg-stone-50/70 border border-stone-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-stone-700" />
                                        <FormLabel>PC / Desktop Logo Height</FormLabel>
                                    </div>
                                    <span className="text-xs font-black text-stone-900 bg-white border border-stone-200 px-2.5 py-1 font-mono">{headerLogoHeight}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={30} 
                                    max={150} 
                                    step={2}
                                    value={headerLogoHeight} 
                                    onChange={e => setHeaderLogoHeight(Number(e.target.value))}
                                    className="w-full accent-stone-950 cursor-pointer h-2 bg-stone-200 rounded-none"
                                />
                                <div className="flex justify-between text-[10px] text-stone-400 font-mono uppercase tracking-wider">
                                    <span>30px</span>
                                    <span>60px (Default)</span>
                                    <span>150px</span>
                                </div>
                            </div>

                            {/* Phone / Mobile Height */}
                            <div className="space-y-3 p-5 bg-stone-50/70 border border-stone-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-stone-700" />
                                        <FormLabel>Phone / Mobile Logo Height</FormLabel>
                                    </div>
                                    <span className="text-xs font-black text-stone-900 bg-white border border-stone-200 px-2.5 py-1 font-mono">{headerLogoHeightMobile}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={30} 
                                    max={150} 
                                    step={2}
                                    value={headerLogoHeightMobile} 
                                    onChange={e => setHeaderLogoHeightMobile(Number(e.target.value))}
                                    className="w-full accent-stone-950 cursor-pointer h-2 bg-stone-200 rounded-none"
                                />
                                <div className="flex justify-between text-[10px] text-stone-400 font-mono uppercase tracking-wider">
                                    <span>30px</span>
                                    <span>60px (Default)</span>
                                    <span>150px</span>
                                </div>
                            </div>
                        </div>

                        {/* Dual Live Header Preview */}
                        <div className="space-y-3 pt-2">
                            <FormLabel>Header Live Preview</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* PC Preview */}
                                <div className="p-6 bg-white border border-stone-200 shadow-inner flex flex-col items-center justify-center min-h-[120px] relative">
                                    <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-400">
                                        <Monitor className="w-3 h-3" />
                                        <span>PC / Laptop View</span>
                                    </div>
                                    {headerLogoImage ? (
                                        <img 
                                            src={headerLogoImage} 
                                            alt="Header Logo PC Preview" 
                                            style={{ maxHeight: `${headerLogoHeight}px`, maxWidth: '240px' }} 
                                            className="object-contain mt-3" 
                                        />
                                    ) : (
                                        <div className="text-stone-400 text-xs font-bold uppercase tracking-wider italic mt-3">No image uploaded</div>
                                    )}
                                </div>

                                {/* Mobile Preview */}
                                <div className="p-6 bg-white border border-stone-200 shadow-inner flex flex-col items-center justify-center min-h-[120px] relative">
                                    <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-400">
                                        <Smartphone className="w-3 h-3" />
                                        <span>Phone / Mobile View</span>
                                    </div>
                                    {headerLogoImage ? (
                                        <img 
                                            src={headerLogoImage} 
                                            alt="Header Logo Mobile Preview" 
                                            style={{ maxHeight: `${headerLogoHeightMobile}px`, maxWidth: '180px' }} 
                                            className="object-contain mt-3" 
                                        />
                                    ) : (
                                        <div className="text-stone-400 text-xs font-bold uppercase tracking-wider italic mt-3">No image uploaded</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 'categories': return (
                <div className={cardClass}>
                    <CompactSectionHeader icon={Tag} title="Catalog Structure" sub="Filters & Collection Banners" />
                    <div className="space-y-6">
                        <form 
                            onSubmit={(e) => { 
                                e.preventDefault(); 
                                handleAddCategory(); 
                            }} 
                            className="flex gap-2 w-full"
                        >
                            <ProfessionalInput 
                                value={newCategoryName} 
                                onChange={e => setNewCategoryName(e.target.value)} 
                                placeholder="Enter category (e.g. Traditional, Western)..." 
                            />
                            <button 
                                type="submit" 
                                className="bg-stone-950 text-white px-6 rounded-none font-bold hover:bg-black transition flex items-center gap-2 whitespace-nowrap text-xs uppercase font-admin active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoriesList.map(cat => (
                                <div key={cat} className="p-4 border border-stone-100 rounded-none bg-stone-50/30 space-y-4 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-sm uppercase tracking-tighter flex items-center gap-2">
                                                {cat}
                                                {pausedCategoriesList.includes(cat) && (
                                                    <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-none uppercase">Paused</span>
                                                )}
                                            </span>
                                        </div>
                                        <button onClick={() => handleRemoveCategory(cat)} className="text-stone-300 hover:text-red-500 transition p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <ImageAssetInput 
                                            label="Explore By Category Image"
                                            currentImage={categoryImages.find(ci => ci.categoryName && ci.categoryName.toLowerCase() === cat.toLowerCase())?.image || ''} 
                                            onImageChange={val => setCategoryImages(prev => {
                                                const exists = prev.some(ci => ci.categoryName && ci.categoryName.toLowerCase() === cat.toLowerCase());
                                                if (exists) {
                                                    return prev.map(ci => ci.categoryName && ci.categoryName.toLowerCase() === cat.toLowerCase() ? {...ci, image: val} : ci);
                                                } else {
                                                    return [...prev, { categoryName: cat, image: val }];
                                                }
                                            })}
                                            options={{maxWidth: 800, quality: 0.85}}
                                        />

                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 block font-admin">
                                                Category Subtitle (Optional)
                                            </label>
                                            <input 
                                                type="text"
                                                value={categoryImages.find(ci => ci.categoryName && ci.categoryName.toLowerCase() === cat.toLowerCase())?.subtitle || ''}
                                                onChange={e => {
                                                    const subVal = e.target.value;
                                                    setCategoryImages(prev => {
                                                        const exists = prev.some(ci => ci.categoryName && ci.categoryName.toLowerCase() === cat.toLowerCase());
                                                        if (exists) {
                                                            return prev.map(ci => ci.categoryName && ci.categoryName.toLowerCase() === cat.toLowerCase() ? {...ci, subtitle: subVal} : ci);
                                                        } else {
                                                            return [...prev, { categoryName: cat, image: '', subtitle: subVal }];
                                                        }
                                                    });
                                                }}
                                                placeholder="e.g. Timeless Elegance"
                                                className="w-full bg-white border border-stone-200 px-3 py-1.5 text-xs text-stone-900 rounded-none focus:outline-none focus:border-stone-900 transition font-admin"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggles Container */}
                                    <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
                                        {/* Pause Toggle */}
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={!pausedCategoriesList.includes(cat)} 
                                                onChange={() => {
                                                    if (pausedCategoriesList.includes(cat)) {
                                                        setPausedCategoriesList(prev => [...prev, cat]);
                                                    } else {
                                                        setPausedCategoriesList(prev => prev.filter(c => c !== cat));
                                                    }
                                                }}
                                                className="rounded-none border-stone-300 text-stone-950 focus:ring-stone-950 w-3.5 h-3.5"
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-stone-500">
                                                Active
                                            </span>
                                        </label>

                                        {/* Menu Visibility Toggle */}
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={menuCategoriesList.includes(cat)} 
                                                onChange={() => {
                                                    if (menuCategoriesList.includes(cat)) {
                                                        setMenuCategoriesList(prev => prev.filter(c => c !== cat));
                                                    } else {
                                                        setMenuCategoriesList(prev => [...prev, cat]);
                                                    }
                                                }}
                                                className="rounded-none border-stone-300 text-stone-950 focus:ring-stone-950 w-3.5 h-3.5"
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-stone-500">
                                                Show in Menu
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Brand Video Showcase Settings */}
                    <div className="bg-white p-6 sm:p-8 border border-stone-200 space-y-6">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-900 font-admin">
                                    Curated Collections Video Showcase
                                </h3>
                                <p className="text-[11px] text-stone-500 font-medium font-admin mt-0.5">
                                    Display an interactive video player card alongside categories on the Home Page.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={brandVideoEnabled} 
                                    onChange={e => setBrandVideoEnabled(e.target.checked)}
                                    className="rounded-none border-stone-300 text-stone-950 focus:ring-stone-950 w-4 h-4"
                                />
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 font-admin">
                                    Enable Video
                                </span>
                            </label>
                        </div>

                        {brandVideoEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1 font-admin">
                                            Desktop Video URL (MP4 / WebM / YouTube)
                                        </label>
                                        <input 
                                            type="text" 
                                            value={brandVideoUrl} 
                                            onChange={e => setBrandVideoUrl(e.target.value)}
                                            placeholder="https://example.com/desktop-video.mp4 or YouTube link"
                                            className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2 text-xs text-stone-900 rounded-none focus:outline-none focus:border-stone-900 font-admin"
                                        />
                                        <p className="text-[10px] text-stone-400 mt-1 font-admin">
                                            Main video link for PC / Desktop view.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1 font-admin">
                                            Mobile Video URL (Optional Phone / Vertical Video)
                                        </label>
                                        <input 
                                            type="text" 
                                            value={brandVideoMobileUrl} 
                                            onChange={e => setBrandVideoMobileUrl(e.target.value)}
                                            placeholder="https://example.com/mobile-portrait.mp4 or YouTube Short"
                                            className="w-full bg-stone-50 border border-amber-300 px-3.5 py-2 text-xs text-stone-900 rounded-none focus:outline-none focus:border-stone-900 font-admin"
                                        />
                                        <p className="text-[10px] text-stone-500 mt-1 font-admin">
                                            Add a vertical/portrait video or YouTube Short for seamless mobile display without letterboxing.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1 font-admin">
                                            Video Title
                                        </label>
                                        <input 
                                            type="text" 
                                            value={brandVideoTitle} 
                                            onChange={e => setBrandVideoTitle(e.target.value)}
                                            placeholder="e.g. Sazo Couture"
                                            className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2 text-xs text-stone-900 rounded-none focus:outline-none focus:border-stone-900 font-admin"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1 font-admin">
                                            Video Subtitle / Tagline
                                        </label>
                                        <input 
                                            type="text" 
                                            value={brandVideoSubtitle} 
                                            onChange={e => setBrandVideoSubtitle(e.target.value)}
                                            placeholder="e.g. Behind The Craft"
                                            className="w-full bg-stone-50 border border-stone-200 px-3.5 py-2 text-xs text-stone-900 rounded-none focus:outline-none focus:border-stone-900 font-admin"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <ImageAssetInput 
                                        label="Desktop Thumbnail (PC)"
                                        currentImage={brandVideoPoster} 
                                        onImageChange={val => setBrandVideoPoster(val)}
                                        options={{maxWidth: 1000, quality: 0.85}}
                                    />

                                    <ImageAssetInput 
                                        label="Mobile Thumbnail (Phone)"
                                        currentImage={brandVideoMobilePoster} 
                                        onImageChange={val => setBrandVideoMobilePoster(val)}
                                        options={{maxWidth: 700, quality: 0.85}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Iframe-Safe Custom Delete Confirmation Modal */}
                    {categoryToDelete && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn font-sans">
                            <div className="bg-white p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-xl space-y-6">
                                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Remove Category?</h4>
                                <p className="text-xs text-stone-500 font-medium leading-relaxed">
                                    Are you sure you want to remove the category <span className="font-bold text-stone-900">"{categoryToDelete}"</span>? Products belonging to this category will no longer show up under filters or category views.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button 
                                        onClick={() => setCategoryToDelete(null)}
                                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmDeleteCategory}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse"
                                    >
                                        Yes, Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );

            case 'general': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Shield} title="Dashboard Security" sub="Admin Access Control" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <FormLabel>Admin Primary Email</FormLabel>
                                    <Lock className="w-3 h-3 text-stone-400 mb-1" />
                                </div>
                                <ProfessionalInput value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                            </div>
                            
                            {/* New Secure Password with Toggle */}
                            <div className="space-y-1">
                                <FormLabel>New Secure Password</FormLabel>
                                <div className="relative group">
                                    <ProfessionalInput 
                                        type={showNewPass ? 'text' : 'password'} 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        placeholder="••••••••" 
                                        className="pr-10"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNewPass(!showNewPass)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-950 transition-colors"
                                    >
                                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Verify New Password with Toggle */}
                            <div className="space-y-1">
                                <FormLabel>Verify New Password</FormLabel>
                                <div className="relative group">
                                    <ProfessionalInput 
                                        type={showConfirmPass ? 'text' : 'password'} 
                                        value={confirmNewPassword} 
                                        onChange={e => setConfirmNewPassword(e.target.value)} 
                                        placeholder="••••••••" 
                                        className="pr-10"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPass(!showConfirmPass)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-950 transition-colors"
                                    >
                                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {isPasswordModified && (
                            <div className="p-4 bg-stone-50 rounded-none border border-stone-100 flex gap-3 items-start animate-fadeIn">
                                <AlertTriangle className="w-5 h-5 text-stone-900 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-stone-900 leading-relaxed uppercase tracking-tight font-admin">
                                    Important: Changing security credentials requires typed confirmation below "Push Updates" to activate.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );

            case 'payments': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={CreditCard} title="Transaction Portal" sub="Gateway Configurations" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 font-admin">
                            <label className={`flex items-center gap-3 p-4 border rounded-none cursor-pointer transition-all ${codEnabled ? 'border-stone-900 bg-stone-50' : 'border-stone-100 bg-stone-50'}`}>
                                <input type="checkbox" checked={codEnabled} onChange={e => setCodEnabled(e.target.checked)} className="w-5 h-5 text-stone-900" />
                                <span className="text-xs font-bold uppercase tracking-tight text-stone-900">Cash on Delivery</span>
                            </label>
                            <label className={`flex items-center gap-3 p-4 border rounded-none cursor-pointer transition-all ${onlinePaymentEnabled ? 'border-stone-900 bg-stone-50' : 'border-stone-100 bg-stone-50'}`}>
                                <input type="checkbox" checked={onlinePaymentEnabled} onChange={e => setOnlinePaymentEnabled(e.target.checked)} className="w-5 h-5 text-stone-900" />
                                <span className="text-xs font-bold uppercase tracking-tight text-stone-900">Online Advance</span>
                            </label>
                        </div>
                        {onlinePaymentEnabled && (
                            <div className="space-y-6 pt-4 border-t border-stone-50">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <FormLabel>Payment Instructions (HTML)</FormLabel>
                                        <select value={onlinePaymentFontSize} onChange={e => setOnlinePaymentFontSize(e.target.value)} className="text-xs font-bold p-1 bg-white border border-stone-200 rounded-none outline-none">
                                            <option value="0.75rem">Compact</option>
                                            <option value="0.875rem">Standard</option>
                                            <option value="1rem">Emphasized</option>
                                        </select>
                                    </div>
                                    <ProfessionalTextarea value={onlinePaymentInfo} onChange={e => setOnlinePaymentInfo(e.target.value)} rows={4} placeholder="<b>Send Charge to:</b> 01XXX..." />
                                    <p className="text-[10px] text-stone-400 uppercase tracking-tight px-1 flex items-center gap-1"><Info className="w-3 h-3" /> Supports &lt;b&gt; and &lt;br&gt; tags.</p>
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>Accepted Methods (Comma Separated)</FormLabel>
                                    <ProfessionalInput value={onlinePaymentMethodsText} onChange={e => setOnlinePaymentMethodsText(e.target.value)} placeholder="Bkash, Nagad, Rocket" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={cardClass}>
                        <div className="space-y-4 mb-6 font-admin">
                            <label className={`flex items-center gap-4 p-5 border-2 rounded-none cursor-pointer transition-all ${freeShippingEnabled ? 'border-black bg-stone-50 shadow-md' : 'border-stone-100 bg-stone-50'}`}>
                                <div className={`p-2 rounded-none ${freeShippingEnabled ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}>
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="flex-grow">
                                    <span className="block text-sm font-black uppercase tracking-tight text-stone-800">Charge Free (Free Delivery)</span>
                                    <span className="text-xs text-stone-400 uppercase font-bold">Disable delivery charge selection and set to 0৳ for all orders</span>
                                </div>
                                <input type="checkbox" checked={freeShippingEnabled} onChange={e => setFreeShippingEnabled(e.target.checked)} className="w-6 h-6 text-stone-900 rounded-none" />
                            </label>
                        </div>

                        <div className="flex justify-between items-center mb-2 pt-4 border-t border-stone-100">
                            <CompactSectionHeader icon={Move} title="Logistics Engine" sub="Delivery Charge Matrix" />
                            <button onClick={handleAddShipping} className="text-stone-900 font-bold text-xs uppercase flex items-center gap-1 border border-stone-100 px-3 py-1 rounded-none hover:bg-stone-50 font-admin transition-all">+ Add Zone</button>
                        </div>
                        <div className="space-y-3 font-admin">
                            {shippingOptions.map(opt => (
                                <div key={opt.id} className="flex gap-3 items-end p-3 bg-stone-50 rounded-none border border-stone-100 group">
                                    <div className="flex-1 space-y-1">
                                        <FormLabel>Location Title</FormLabel>
                                        <ProfessionalInput value={opt.label} onChange={e => setShippingOptions(p => p.map(o => o.id === opt.id ? {...o, label: e.target.value} : o))} placeholder="Inside Dhaka" />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <FormLabel>Charge (৳)</FormLabel>
                                        <ProfessionalInput type="number" value={opt.charge} onChange={e => setShippingOptions(p => p.map(o => o.id === opt.id ? {...o, charge: Number(e.target.value)} : o))} className="font-bold text-stone-900" />
                                    </div>
                                    <button onClick={() => setShippingOptions(p => p.filter(o => o.id !== opt.id))} className="p-2.5 text-stone-300 hover:text-red-500 transition bg-white border border-stone-100 rounded-none group-hover:border-red-100 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {shippingOptions.length === 0 && <p className="text-center py-6 text-stone-300 text-xs uppercase tracking-tight border border-dashed rounded-none">No shipping zones configured.</p>}
                        </div>
                    </div>
                </div>
            );

            case 'appearance': return (
                <div className="space-y-6">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Layout} title="The Grand Fold" sub="Hero Slider Management" />
                        <label className="flex items-center gap-3 mb-6 p-3 bg-stone-50 rounded-none border border-stone-100 cursor-pointer">
                            <input type="checkbox" checked={showSliderText} onChange={e => setShowSliderText(e.target.checked)} className="w-5 h-5 rounded-none text-rose-800" />
                            <span className="text-xs font-bold uppercase text-stone-600 tracking-tight">Active Slider Overlays (Title/Buttons)</span>
                        </label>
                        <div className="space-y-6">
                            {sliderImages.map((slide, idx) => (
                                <div key={slide.id} className="p-5 border border-stone-100 rounded-none bg-white shadow-sm relative group/slide">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded-none">SLIDE #{idx + 1}</span>
                                        <button onClick={() => setSliderImages(p => p.filter(s => s.id !== slide.id))} className="p-1 text-stone-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <FormLabel>Main Headline</FormLabel>
                                                <ProfessionalInput value={slide.title} onChange={e => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, title: e.target.value} : s))} />
                                            </div>
                                            <div className="space-y-1">
                                                <FormLabel>Sub-description</FormLabel>
                                                <ProfessionalTextarea value={slide.subtitle} onChange={e => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, subtitle: e.target.value} : s))} rows={2} />
                                            </div>
                                            <div className="space-y-1">
                                                <FormLabel>Title CSS Color Class</FormLabel>
                                                <ProfessionalInput value={slide.color} onChange={e => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, color: e.target.value} : s))} placeholder="text-white / text-rose-800" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <ImageAssetInput label="Desktop Canvas" currentImage={slide.image} onImageChange={val => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, image: val} : s))} options={{maxWidth: 1600, quality: 0.8}} />
                                            <ImageAssetInput label="Mobile Canvas" currentImage={slide.mobileImage || ''} onImageChange={val => setSliderImages(p => p.map(s => s.id === slide.id ? {...s, mobileImage: val} : s))} options={{maxWidth: 800, quality: 0.8}} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleAddSlide} className="w-full py-8 border-2 border-dashed border-stone-100 rounded-none text-stone-400 hover:text-rose-800 hover:bg-rose-50/30 transition-all font-bold uppercase text-xs tracking-wider flex flex-col items-center justify-center gap-2">
                                <PlusCircle className="w-6 h-6" /> Append Hero Dimension
                            </button>
                        </div>
                    </div>
                </div>
            );

            case 'marketing': return (
                <div className={cardClass}>
                <CompactSectionHeader icon={Gift} title="Conversion Optimization" sub="Exit Intent Popup Strategy" />
                
                <div className="p-5 bg-stone-100 rounded-none border border-stone-200 mb-6 font-admin">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-white rounded-none shadow-sm">
                            <Sparkles className="w-6 h-6 text-stone-900" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase text-stone-900 mb-1">Boost Your Sales Performance</h4>
                            <p className="text-xs text-stone-700 leading-relaxed uppercase font-semibold">
                                The Exit Intent Popup appears when a customer is about to leave the checkout or cart page. 
                                Offering a small discount at this critical moment can recover up to 15-20% of abandoned carts.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 font-admin">
                    <label className={`flex items-center gap-4 p-5 border-2 rounded-none cursor-pointer transition-all ${exitIntentPopupEnabled ? 'border-rose-600 bg-rose-50/50 shadow-md' : 'border-stone-100 bg-stone-50'}`}>
                        <div className={`p-2 rounded-none ${exitIntentPopupEnabled ? 'bg-rose-600 text-white' : 'bg-stone-200 text-stone-400'}`}>
                            {exitIntentPopupEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </div>
                        <div className="flex-grow">
                            <span className="block text-sm font-black uppercase tracking-tight text-stone-800 font-admin">Exit Intent Strategy</span>
                            <span className="text-xs text-stone-400 uppercase font-bold">Show popup when user tries to leave site</span>
                        </div>
                        <input type="checkbox" checked={exitIntentPopupEnabled} onChange={e => setExitIntentPopupEnabled(e.target.checked)} className="w-6 h-6 text-rose-600 rounded-none" />
                    </label>

                    {exitIntentPopupEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-stone-50/30 border border-stone-100 rounded-none animate-fadeIn">
                            <div className="space-y-2">
                                <FormLabel>Discount Amount (৳)</FormLabel>
                                <div className="relative font-admin">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400">৳</span>
                                    <ProfessionalInput 
                                        type="number" 
                                        value={exitIntentDiscount} 
                                        onChange={e => setExitIntentDiscount(Number(e.target.value))} 
                                        className="pl-8 font-black text-stone-900"
                                    />
                                </div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight px-1">Amount to show on the popup tag</p>
                            </div>
                            
                            <div className="space-y-2">
                                <FormLabel>Coupon Code</FormLabel>
                                <div className="relative font-admin">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                    <ProfessionalInput 
                                        value={exitIntentCouponCode} 
                                        onChange={e => setExitIntentCouponCode(e.target.value.toUpperCase())} 
                                        className="pl-12 font-black tracking-widest text-stone-900"
                                        placeholder="SAVE60"
                                    />
                                </div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight px-1 font-admin font-medium">Code customer will copy to use</p>
                            </div>
                            
                            <div className="md:col-span-2 p-4 bg-white rounded-none border border-stone-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-none">
                                        <Info className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <p className="text-xs text-stone-500 font-bold uppercase">
                                        Visual Preview matches the demo picture with gradient colors.
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-none uppercase">Current Setting Valid</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
        case 'content': return (
                <div className="space-y-6 font-admin">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={AlignLeft} title="Brand Legacy" sub="Footer & Global Text" />
                        <div className="space-y-8">
                            <div className="space-y-1">
                                <FormLabel>Footer Brand Bio</FormLabel>
                                <ProfessionalTextarea value={footerDescription} onChange={e => setFooterDescription(e.target.value)} rows={3} />
                            </div>

                            <div className="pt-6 border-t border-stone-50">
                                <FormLabel>Public Contact Details (Footer)</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-1">
                                        <FormLabel>WhatsApp Number</FormLabel>
                                        <ProfessionalInput value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+8801..." />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6 px-2">
                                        <input type="checkbox" checked={showWhatsAppButton} onChange={e => setShowWhatsAppButton(e.target.checked)} className="w-5 h-5 rounded-none text-stone-900 focus:ring-stone-950/20" />
                                        <span className="text-xs font-bold text-stone-600 uppercase tracking-tight">Show WhatsApp Button</span>
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel>Contact Hotline</FormLabel>
                                        <ProfessionalInput value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel>Support Email</FormLabel>
                                        <ProfessionalInput value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel>Footer Display Email</FormLabel>
                                        <ProfessionalInput value={footerEmail} onChange={e => setFooterEmail(e.target.value)} placeholder="hello@sazo.fashion" />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <FormLabel>Branch/Office Address</FormLabel>
                                        <ProfessionalTextarea value={contactAddress} onChange={e => setContactAddress(e.target.value)} rows={2} />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <FormLabel>Google Maps Embed URL (Iframe Code)</FormLabel>
                                        <ProfessionalTextarea 
                                            value={contactMapEmbed} 
                                            onChange={e => setContactMapEmbed(e.target.value)} 
                                            rows={2} 
                                            placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                                        />
                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight px-1 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Paste the full iframe code from Google Maps share menu.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <CompactSectionHeader icon={Share2} title="Social Footprint" sub="External Profile Links" />
                        <div className="space-y-4">
                            {socialMediaLinks.map((link, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-stone-50 p-2 rounded-none border border-stone-200 group">
                                    <select 
                                        value={link.platform || 'Facebook'} 
                                        onChange={e => setSocialMediaLinks(p => p.map((l, i) => i === idx ? {...l, platform: e.target.value} : l))} 
                                        className="p-2 bg-white border border-stone-200 rounded-none text-xs font-bold uppercase w-32 outline-none shadow-sm focus:border-rose-500 transition-all font-admin"
                                    >
                                        <option value="Facebook">Facebook</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="Youtube">Youtube</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                    </select>
                                    <input 
                                        value={link.url || ''} 
                                        onChange={e => setSocialMediaLinks(p => p.map((l, i) => i === idx ? {...l, url: e.target.value} : l))} 
                                        placeholder="https://..." 
                                        className="flex-1 p-2 bg-white border border-stone-200 rounded-none text-xs outline-none shadow-sm focus:border-rose-500 transition-all font-admin" 
                                    />
                                    <button onClick={() => setSocialMediaLinks(p => p.filter((_, i) => i !== idx))} className="p-2 text-stone-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                            <button onClick={() => setSocialMediaLinks(p => [...p, {platform: 'Facebook', url: ''}])} className="text-stone-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1 border border-stone-100 px-4 py-2 rounded-none hover:bg-stone-50 transition-all font-admin transition-all active:scale-95">+ Add Profile</button>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <div className={cardClass.replace('bg-white p-5 sm:p-10', 'p-0 shadow-none border-none animate-none space-y-6')}>
                            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider font-admin">Global Size Guide</h4>
                                    <p className="text-[10px] text-stone-400 uppercase font-bold mt-1">Configure standard sizing for all products</p>
                                </div>
                                <button 
                                    onClick={() => setSizeGuide(p => [...p, { size: '', chest: '', waist: '', length: '' }])}
                                    className="text-[10px] font-black p-2 bg-stone-900 text-white uppercase tracking-widest hover:bg-black transition-colors"
                                >
                                    + Add Row
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-2 px-2 hidden md:grid">
                                    <div className="col-span-2"><FormLabel>Size</FormLabel></div>
                                    <div className="col-span-3"><FormLabel>Chest (in)</FormLabel></div>
                                    <div className="col-span-3"><FormLabel>Waist (in)</FormLabel></div>
                                    <div className="col-span-3"><FormLabel>Length (in)</FormLabel></div>
                                    <div className="col-span-1"></div>
                                </div>
                                
                                {sizeGuide.map((row, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-stone-50/30 p-3 md:p-1 border border-stone-100">
                                        <div className="col-span-2">
                                            <div className="md:hidden"><FormLabel>Size</FormLabel></div>
                                            <ProfessionalInput 
                                                value={row.size} 
                                                onChange={e => setSizeGuide(p => p.map((r, i) => i === idx ? {...r, size: e.target.value} : r))}
                                                placeholder="S…"
                                                className="!p-2 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <div className="md:hidden"><FormLabel>Chest</FormLabel></div>
                                            <ProfessionalInput 
                                                value={row.chest} 
                                                onChange={e => setSizeGuide(p => p.map((r, i) => i === idx ? {...r, chest: e.target.value} : r))}
                                                placeholder="36"
                                                className="!p-2 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <div className="md:hidden"><FormLabel>Waist</FormLabel></div>
                                            <ProfessionalInput 
                                                value={row.waist} 
                                                onChange={e => setSizeGuide(p => p.map((r, i) => i === idx ? {...r, waist: e.target.value} : r))}
                                                placeholder="30"
                                                className="!p-2 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <div className="md:hidden"><FormLabel>Length</FormLabel></div>
                                            <ProfessionalInput 
                                                value={row.length} 
                                                onChange={e => setSizeGuide(p => p.map((r, i) => i === idx ? {...r, length: e.target.value} : r))}
                                                placeholder="40"
                                                className="!p-2 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button onClick={() => setSizeGuide(p => p.filter((_, i) => i !== idx))} className="text-stone-300 hover:text-red-500 p-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                {sizeGuide.length === 0 && (
                                    <p className="text-center py-8 text-stone-300 text-xs uppercase font-bold border border-dashed border-stone-200">No sizing data configured.</p>
                                )}
                            </div>

                            <div className="space-y-1 pt-6 border-t border-stone-50">
                                <div className="flex justify-between items-center px-1 mb-1 font-admin">
                                    <FormLabel>Privacy Charter</FormLabel>
                                    <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-none uppercase font-black font-admin">logic variable: {"{{CONTACT_EMAIL}}"}</span>
                                </div>
                                <ProfessionalTextarea value={privacyPolicy} onChange={e => setPrivacyPolicy(e.target.value)} rows={12} className="font-mono text-xs leading-relaxed" />
                            </div>
                        </div>
                    </div>
                </div>
            );
            case 'tracking': return (
                <div className="space-y-6 font-admin">
                    <div className={cardClass}>
                        <CompactSectionHeader icon={Globe} title="Server-Side Tracking" sub="GA4 Measurement Protocol" />
                        <div className="p-4 bg-stone-50 rounded-none border border-stone-100 mb-6 font-admin">
                            <h4 className="text-xs font-bold text-stone-900 uppercase mb-2">How to get these?</h4>
                            <ul className="text-[11px] text-stone-700 space-y-1 list-disc ml-4">
                                <li><b>Measurement ID:</b> Admin &gt; Data Streams &gt; Select Stream &gt; Measurement ID (G-XXXXXXX)</li>
                                <li><b>API Secret:</b> Admin &gt; Data Streams &gt; Select Stream &gt; Measurement Protocol API secrets (Create new)</li>
                            </ul>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-4 pt-4 border-t border-stone-100">
                                <h4 className="text-[11px] font-bold text-stone-900 uppercase">Google Analytics 4</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <FormLabel>GA4 Measurement ID</FormLabel>
                                        <ProfessionalInput value={gaMeasurementId} onChange={e => setGaMeasurementId(e.target.value)} placeholder="G-XXXXXXXXXX" />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel>GA4 API Secret</FormLabel>
                                        <ProfessionalInput value={gaApiSecret} onChange={e => setGaApiSecret(e.target.value)} placeholder="API Secret Key" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-stone-100">
                                <h4 className="text-[11px] font-bold text-stone-900 uppercase">Meta (Facebook) CAPI</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <FormLabel>Pixel ID</FormLabel>
                                        <ProfessionalInput value={fbPixelId} onChange={e => setFbPixelId(e.target.value)} placeholder="1234567890" />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel>CAPI Access Token</FormLabel>
                                        <ProfessionalInput value={fbAccessToken} onChange={e => setFbAccessToken(e.target.value)} placeholder="EAAB..." />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel>Meta Test Event Code</FormLabel>
                                        <ProfessionalInput value={fbTestCode} onChange={e => setFbTestCode(e.target.value)} placeholder="TEST12345" />
                                        <p className="text-[9px] text-stone-500">Only for testing. Remove this code when you're done testing to avoid issues.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-orange-100">
                                <h4 className="text-[11px] font-bold text-orange-900 uppercase">Google Tag Manager</h4>
                                <div className="space-y-1">
                                    <FormLabel>GTM ID</FormLabel>
                                    <ProfessionalInput value={gtmId} onChange={e => setGtmId(e.target.value)} placeholder="GTM-XXXXXXX" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-stone-50 rounded-none border border-stone-200">
                             <p className="text-xs text-stone-500 font-medium">
                                This configuration enables <b>Server-Side Tracking</b>. Unlike standard GTM, events are sent directly from your server to Google Analytics. This bypasses ad-blockers and ensures 100% data accuracy for orders.
                             </p>
                        </div>
                    </div>
                </div>
            );
            case 'emails': return (
                <div className={cardClass}>
                    <CompactSectionHeader icon={Mail} title="Email & Notifications" sub="SMTP Alert Dispatcher" />
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs text-stone-500 leading-relaxed font-bold">
                                Configure a custom SMTP server (such as Hostinger, custom domain email, cPanel, Mailgun, or SendGrid) to automatically receive real-time email notifications for new orders and user messages.
                            </p>
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-stone-100 font-admin">
                            <h4 className="text-[11px] font-bold text-stone-900 uppercase">Notification Recipients</h4>
                            <div className="space-y-1">
                                <FormLabel>Recipients Email List (Comma-separated)</FormLabel>
                                <ProfessionalInput 
                                    value={notificationRecipients} 
                                    onChange={e => setNotificationRecipients(e.target.value)} 
                                    placeholder="sazo.ceo@gmail.com, info@sazo.com" 
                                />
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                    Operational alerts are automatically copied to sazo.ceo@gmail.com and sazo.system@gmail.com. Add any additional emails here.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-stone-100 font-admin">
                            <h4 className="text-[11px] font-bold text-stone-900 uppercase">SMTP Outbound Server Config</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <FormLabel>SMTP Server (Host)</FormLabel>
                                    <ProfessionalInput 
                                        value={smtpHost} 
                                        onChange={e => setSmtpHost(e.target.value)} 
                                        placeholder="smtp.hostinger.com" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>SMTP Port</FormLabel>
                                    <ProfessionalInput 
                                        type="number"
                                        value={smtpPort} 
                                        onChange={e => setSmtpPort(Number(e.target.value))} 
                                        placeholder="587" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>Sender Brand Name</FormLabel>
                                    <ProfessionalInput 
                                        value={smtpSenderName} 
                                        onChange={e => setSmtpSenderName(e.target.value)} 
                                        placeholder="SAZO ATELIER" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>SMTP Security (SSL/TLS)</FormLabel>
                                    <select 
                                        value={smtpSecure ? 'true' : 'false'} 
                                        onChange={e => setSmtpSecure(e.target.value === 'true')}
                                        className="w-full p-3 bg-stone-50 border border-stone-100 rounded-none text-sm text-stone-900 font-bold font-admin focus:border-black outline-none"
                                    >
                                        <option value="false">STARTTLS / Port 587 (Recommended)</option>
                                        <option value="true">SSL / Port 465</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-stone-100 font-admin">
                            <h4 className="text-[11px] font-bold text-stone-900 uppercase">SMTP Authentication Credentials</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <FormLabel>SMTP Username / Email</FormLabel>
                                    <ProfessionalInput 
                                        value={smtpUser} 
                                        onChange={e => setSmtpUser(e.target.value)} 
                                        placeholder="notifications@sazo.com" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <FormLabel>SMTP Password</FormLabel>
                                    <div className="relative">
                                        <input 
                                            type={showSmtpPass ? 'text' : 'password'}
                                            value={smtpPass} 
                                            onChange={e => setSmtpPass(e.target.value)} 
                                            placeholder="••••••••••••••••"
                                            className="w-full p-3 bg-stone-50 border border-stone-100 rounded-none text-sm text-stone-900 focus:border-black focus:ring-4 focus:ring-stone-950/5 transition-all outline-none font-bold font-admin pr-10"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowSmtpPass(!showSmtpPass)} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 focus:outline-none"
                                        >
                                            {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-1 block">
                                        If using Gmail, generate and use a 16-character <b>Google App Password</b> instead of your personal password.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 'telegram': return (
                <div className={cardClass}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
                        <CompactSectionHeader icon={MessageSquare} title="Telegram Bot Notifications" sub="Real-time Phone Ringtone & Vibration Alert (1-2s)" />
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Instant Phone Push
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Enable/Disable Toggle */}
                        <div className="p-4 bg-stone-50 border border-stone-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-tight">Enable Telegram Instant Alert</h4>
                                <p className="text-[10px] text-stone-500 mt-0.5">Receive immediate notification with loud ringtone sound on phone as soon as an order is placed.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={telegramEnabled} 
                                    onChange={e => setTelegramEnabled(e.target.checked)} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-950"></div>
                            </label>
                        </div>

                        {/* Credentials inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormLabel>Telegram Bot Token</FormLabel>
                                <div className="relative">
                                    <input 
                                        type={showTelegramToken ? 'text' : 'password'}
                                        value={telegramBotToken} 
                                        onChange={e => setTelegramBotToken(e.target.value)} 
                                        placeholder="7890123456:AAFx..." 
                                        className="w-full p-3 bg-stone-50 border border-stone-100 rounded-none text-sm text-stone-900 focus:border-black focus:ring-4 focus:ring-stone-950/5 transition-all outline-none font-bold font-admin pr-10"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowTelegramToken(!showTelegramToken)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900"
                                    >
                                        {showTelegramToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                    Obtained from @BotFather on Telegram.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <FormLabel>Telegram Chat ID or Group ID</FormLabel>
                                <ProfessionalInput 
                                    value={telegramChatId} 
                                    onChange={e => setTelegramChatId(e.target.value)} 
                                    placeholder="123456789 or -100123456789" 
                                />
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                    Your user ID or Group Chat ID. (e.g. from @userinfobot)
                                </p>
                            </div>
                        </div>

                        {/* Test & Guide Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100">
                            <button
                                type="button"
                                onClick={handleTestTelegram}
                                disabled={isTestingTelegram || !telegramBotToken || !telegramChatId}
                                className="px-6 py-3 bg-stone-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isTestingTelegram ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin text-amber-400" />
                                        Sending Test Notification...
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare className="w-4 h-4 text-sky-400" />
                                        Send Test Notification 🔔
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowTelegramGuide(!showTelegramGuide)}
                                className="text-xs font-bold text-stone-600 hover:text-stone-950 underline underline-offset-4 flex items-center gap-1.5 uppercase tracking-wider"
                            >
                                <HelpCircle className="w-4 h-4 text-stone-400" />
                                {showTelegramGuide ? "Hide Setup Guide" : "1-Minute Setup Guide (সহজ নিয়ম)"}
                            </button>
                        </div>

                        {/* Step-by-Step Guide Box */}
                        {showTelegramGuide && (
                            <div className="p-6 bg-stone-50 border border-stone-200/80 space-y-4 animate-fadeIn">
                                <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                                    📱 টেলিগ্রাম বোট সেটআপ করার সহজ ৪ টি ধাপ (1-Minute Setup):
                                </h4>
                                <ol className="space-y-3 text-xs text-stone-700 leading-relaxed list-decimal list-inside font-sans font-medium">
                                    <li>
                                        <b>ধাপ ১ (Bot Token তৈরি):</b> টেলিগ্রাম অ্যাপ খুলে সার্চবারে <code>@BotFather</code> লিখে সার্চ দিন। এরপর <code>/newbot</code> পাঠিয়ে যেকোনো একটি নাম ও ইউজারনেম দিন। BotFather আপনাকে একটি <b>API Token</b> দিবে (যেমন: <code>7890123456:AAFx...</code>)। সেটি কপি করে উপরের <b>Bot Token</b> বক্সে বসান।
                                    </li>
                                    <li>
                                        <b>ধাপ ২ (Bot স্টার্ট করা):</b> BotFather যে বোটের লিংক দিয়েছে (t.me/your_bot_username) সেখানে ক্লিক করে টেলিগ্রামে আপনার নতুন বোটে ঢুকে <b>Start</b> বাটনে চাপ দিন।
                                    </li>
                                    <li>
                                        <b>ধাপ ৩ (Chat ID বের করা):</b> টেলিগ্রাম সার্চবারে <code>@userinfobot</code> লিখে সার্চ দিন এবং <code>/start</code> সেন্ড করুন। বোটটি আপনাকে আপনার <b>Id</b> সংখ্যাটি দেখাবে (যেমন: <code>123456789</code>)। সেটি কপি করে <b>Chat ID</b> বক্সে বসান।
                                    </li>
                                    <li>
                                        <b>ধাপ ৪ (টেস্ট ও সেভ):</b> এবার <b>"Send Test Notification 🔔"</b> বাটনে চাপ দিন। আপনার ফোনে টেলিগ্রামে শব্দ করে নোটিফিকেশন এসে পৌঁছাবে! এরপর নিচে <b>Push</b> বাটনে ক্লিক করে সেভ করে নিন।
                                    </li>
                                </ol>
                            </div>
                        )}
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-48 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 pt-4 font-admin">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-none shadow-xl border border-stone-100"><SettingsIcon className="w-6 h-6 text-stone-900" /></div>
                    <div>
                        <h1 className="text-2xl font-black text-stone-900 tracking-tighter uppercase leading-none">Core <span className="text-stone-500">Configurations</span></h1>
                        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1.5 ml-1 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 bg-stone-900 rounded-none animate-pulse"></span> SYSTEM SYNCHRONIZED
                        </p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-wider mb-0.5 leading-none">Sync Key: {new Date().getHours()}X-{new Date().getMinutes()}Y</p>
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-wider leading-none">Core v2.5.0-Compact</p>
                    </div>
                </div>
            </div>

            {/* Layout Body */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start relative">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:col-span-3 lg:sticky lg:top-24 z-30">
                    <div className="bg-white/90 backdrop-blur-3xl p-1.5 sm:p-3 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-stone-100 flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide gap-1 sm:gap-1.5 sticky top-20 lg:top-0">
                        <TabButtonUI label="Header Logo" isActive={activeTab === 'headerLogo'} onClick={() => handleTabSwitch('headerLogo')} icon={ImageIcon} />
                        <TabButtonUI label="Categories" isActive={activeTab === 'categories'} onClick={() => handleTabSwitch('categories')} icon={Tag} />
                        <TabButtonUI label="Security" isActive={activeTab === 'general'} onClick={() => handleTabSwitch('general')} icon={Shield} />
                        <TabButtonUI label="Telegram 🔔" isActive={activeTab === 'telegram'} onClick={() => handleTabSwitch('telegram')} icon={MessageSquare} />
                        <TabButtonUI label="SMTP Email" isActive={activeTab === 'emails'} onClick={() => handleTabSwitch('emails')} icon={Mail} />
                        <TabButtonUI label="Payments" isActive={activeTab === 'payments'} onClick={() => handleTabSwitch('payments')} icon={CreditCard} />
                        <TabButtonUI label="Hero" isActive={activeTab === 'appearance'} onClick={() => handleTabSwitch('appearance')} icon={Layout} />
                        <TabButtonUI label="Marketing" isActive={activeTab === 'marketing'} onClick={() => handleTabSwitch('marketing')} icon={Gift} />
                        <TabButtonUI label="Tracking" isActive={activeTab === 'tracking'} onClick={() => handleTabSwitch('tracking')} icon={Globe} />
                        <TabButtonUI label="Footer" isActive={activeTab === 'content'} onClick={() => handleTabSwitch('content')} icon={Layout} />
                    </div>
                </aside>
                
                {/* Scrollable Content Region */}
                <main className="w-full lg:col-span-9 pb-32">
                    {renderTabContent()}
                </main>
            </div>
            
            {/* Float-Synced Save Action (Modern) */}
            <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[100] flex flex-col items-end gap-3">
                 {/* Verification box: ONLY visible if active tab is Security AND password fields have value */}
                 {isConfirmationRequired && (
                    <div className={`p-4 bg-white/95 backdrop-blur-xl rounded-none shadow-2xl border border-stone-100 transition-all duration-500 transform ${isSaved ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-stone-900" />
                            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Type CONFIRM to activate</span>
                        </div>
                        <input 
                            type="text" 
                            value={confirmSyncText || ''} 
                            onChange={e => setConfirmSyncText(e.target.value.toUpperCase())} 
                            placeholder="CONFIRM"
                            className={`w-36 p-2 bg-stone-50 border rounded-none text-xs font-black tracking-widest text-center transition-all outline-none ${confirmSyncText === 'CONFIRM' ? 'border-green-500 ring-4 ring-green-100 bg-white' : 'border-stone-200 focus:border-stone-900 focus:ring-4 focus:ring-stone-100'}`}
                        />
                    </div>
                 )}

                <button 
                    onClick={handleSave} 
                    disabled={isSaving || isSaved || !isConfirmationValid} 
                    className={`
                        group px-6 sm:px-8 py-4 sm:py-5 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] font-black transition-all duration-500 flex items-center gap-3 sm:gap-4 active:scale-95
                        ${isSaved 
                            ? 'bg-green-500 text-white scale-105 shadow-green-200' 
                            : isConfirmationValid
                                ? 'bg-stone-950 text-white hover:bg-black hover:-translate-y-2'
                                : 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed'
                        }
                        disabled:opacity-80
                    `}
                >
                    <div className={`p-2 rounded-none transition-all duration-500 ${isSaved ? 'bg-white/20' : (isConfirmationValid ? 'bg-white/10 group-hover:rotate-12' : 'bg-stone-300')}`}>
                        {isSaving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : isSaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col items-start text-left leading-none pr-1 sm:pr-2">
                        <span className="uppercase tracking-wider text-[10px] sm:text-[11px] opacity-70 mb-1 sm:mb-1.5 font-bold">{isSaving ? 'Processing' : isSaved ? 'Success' : 'Ready'}</span>
                        <span className="uppercase tracking-widest text-xs sm:text-sm font-black">{isSaving ? 'Syncing...' : isSaved ? 'Done' : 'Push'}</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

// Internal Nav Link UI
const TabButtonUI: React.FC<{ label: string; isActive: boolean; onClick: () => void; icon: React.ElementType }> = ({ label, isActive, onClick, icon: Icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`whitespace-nowrap lg:w-full text-left px-4 py-3 sm:py-3.5 rounded-none transition-all duration-500 text-sm font-black flex items-center gap-3 group ${
            isActive 
                ? 'bg-stone-950 text-white shadow-xl translate-y-0 lg:translate-x-1.5' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-950 hover:translate-x-1'
        }`}
    >
        <div className={`p-2 rounded-none transition-all duration-500 ${isActive ? 'bg-white/20' : 'bg-stone-100 group-hover:bg-stone-200'}`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <span className="uppercase tracking-tight text-[11px] sm:text-xs">{label}</span>
        {isActive && <ChevronRight className="hidden lg:block w-3.5 h-3.5 ml-auto opacity-50" />}
    </button>
);

export default AdminSettingsPage;
