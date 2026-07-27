
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Music2 as Tiktok } from 'lucide-react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Skeleton, Shimmer } from '../components/Skeleton';

const ContactSkeleton: React.FC = () => (
    <main className="max-w-[1750px] mx-auto px-6 sm:px-12 lg:px-24 pt-32 sm:pt-48 pb-24 overflow-hidden">
        <div className="flex flex-col items-center mb-32 text-center">
            <Skeleton className="h-3 w-32 mb-6" />
            <Skeleton className="h-16 w-3/4 max-w-xl mb-10" />
            <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
            <div className="lg:col-span-5 h-[600px]">
                <Shimmer className="h-full w-full rounded-[4rem]" />
            </div>
            <div className="lg:col-span-7 h-[600px]">
                <Shimmer className="h-full w-full" />
            </div>
        </div>
    </main>
);

const ContactPage: React.FC = () => {
  const { addContactMessage, notify, settings, loading } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
        notify('Please provide all details.', 'error');
        return;
    }

    setIsSubmitting(true);
    try {
      await addContactMessage(formData);
      notify('Thank you for reaching out. We will contact you shortly.', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      notify('Failed to transmit message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <ContactSkeleton />;

  return (
    <main className="max-w-[1750px] mx-auto px-4 sm:px-12 lg:px-24 pt-20 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-12 sm:mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium text-brand-accent uppercase tracking-[0.3em] mb-3 sm:mb-4"
          >
            Concierge
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-serif italic text-stone-900"
          >
            Connect with SAZO
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 sm:mt-6 text-stone-600 text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto px-4"
          >
            Our team is dedicated to providing you with an exceptional experience. Whether you have an inquiry or simply wish to share your thoughts, we await your message.
          </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Contact Info - Left */}
        <div className="lg:col-span-5 space-y-8 sm:space-y-12">
          <div className="bg-[#fcf8f6] p-6 sm:p-12 lg:p-14 border border-stone-200/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
            
            <h3 className="text-2xl sm:text-3xl font-serif italic text-stone-900 mb-8 sm:mb-10 relative z-10">Inquiries</h3>
            
            <div className="space-y-8 sm:space-y-10 relative z-10">
                {settings?.contactAddress && (
                    <div className="flex gap-4 sm:gap-6 group/item">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-white border border-stone-200/80 flex items-center justify-center transition-all duration-500 group-hover/item:bg-brand-accent group-hover/item:border-brand-accent">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-stone-500 transition-colors group-hover/item:text-white" />
                        </div>
                        <div className="flex-1 pt-1 sm:pt-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Our Atelier</p>
                            <p className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed whitespace-pre-wrap">{settings.contactAddress}</p>
                        </div>
                    </div>
                )}
                
                {settings?.contactPhone && (
                    <div className="flex gap-4 sm:gap-6 group/item">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-white border border-stone-200/80 flex items-center justify-center transition-all duration-500 group-hover/item:bg-brand-accent group-hover/item:border-brand-accent">
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-stone-500 transition-colors group-hover/item:text-white" />
                        </div>
                        <div className="flex-1 pt-1 sm:pt-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Phone Services</p>
                            <p className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed">{settings.contactPhone}</p>
                        </div>
                    </div>
                )}

                {settings?.contactEmail && (
                    <div className="flex gap-4 sm:gap-6 group/item">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-white border border-stone-200/80 flex items-center justify-center transition-all duration-500 group-hover/item:bg-brand-accent group-hover/item:border-brand-accent">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-stone-500 transition-colors group-hover/item:text-white" />
                        </div>
                        <div className="flex-1 pt-1 sm:pt-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Email Concierge</p>
                            <a href={`mailto:${settings.contactEmail}`} className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed hover:text-brand-accent transition-colors break-all block">{settings.contactEmail}</a>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-stone-200/60">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Availability</p>
                    <div className="space-y-1.5 text-[11px] sm:text-xs font-medium text-stone-700 tracking-wider uppercase leading-relaxed">
                        <p>SUN - THU: 10AM - 8PM</p>
                        <p>FRI: 2PM - 8PM</p>
                    </div>
                  </div>
                  <div>
                     <p className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Social</p>
                     <div className="flex gap-3">
                        <a 
                          href={settings?.socialMediaLinks?.find(l => l.platform?.toLowerCase().includes('instagram'))?.url || "https://instagram.com"} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          aria-label="Instagram"
                          className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:text-white hover:bg-brand-accent hover:border-brand-accent shadow-sm transition-all duration-300"
                        >
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a 
                          href={settings?.socialMediaLinks?.find(l => l.platform?.toLowerCase().includes('facebook'))?.url || "https://facebook.com"} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          aria-label="Facebook"
                          className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:text-white hover:bg-brand-accent hover:border-brand-accent shadow-sm transition-all duration-300"
                        >
                            <Facebook className="w-4 h-4" />
                        </a>
                        <a 
                          href={settings?.socialMediaLinks?.find(l => l.platform?.toLowerCase().includes('tiktok'))?.url || "https://tiktok.com"} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          aria-label="TikTok"
                          className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:text-white hover:bg-brand-accent hover:border-brand-accent shadow-sm transition-all duration-300"
                        >
                            <Tiktok className="w-4 h-4" />
                        </a>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Contact Form - Right */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-12 lg:p-14 border border-stone-200/60 shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-serif italic text-stone-900 mb-8 sm:mb-10">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider ml-1">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-5 py-3.5 sm:px-6 sm:py-4 border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-all duration-300"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider ml-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="w-full px-5 py-3.5 sm:px-6 sm:py-4 border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-all duration-300"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="message" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider ml-1">How can we assist you?</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Type your message here..."
                    className="w-full px-5 py-3.5 sm:px-6 sm:py-4 border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-all duration-300 resize-none min-h-[140px] sm:min-h-[180px]"
                    required
                ></textarea>
            </div>
            
            <div className="pt-2">
                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 sm:px-12 sm:py-4 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-brand-accent active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-3"
                >
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                {!isSubmitting && <Send className="w-4 h-4 opacity-70" />}
                </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Section */}
      {settings?.contactMapEmbed && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="mt-20 sm:mt-28 w-full"
        >
          <div className="relative group overflow-hidden border border-stone-200/60 shadow-sm bg-white p-4 sm:p-6">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <span className="text-xs font-medium text-brand-accent uppercase tracking-widest mb-2 block">Visit Us</span>
                <h3 className="text-2xl sm:text-3xl font-serif italic text-stone-900">Find Our Atelier</h3>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-600 uppercase tracking-widest bg-stone-50 px-5 py-2 border border-stone-200">
                <MapPin className="w-3.5 h-3.5 text-brand-accent" />
                <span>Navigating Your Style</span>
              </div>
            </div>
            
            <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-stone-50 relative">
              {settings.contactMapEmbed.includes('<iframe') ? (
                <div 
                  className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:absolute [&>iframe]:inset-0 border-0"
                  dangerouslySetInnerHTML={{ __html: settings.contactMapEmbed }}
                />
              ) : (
                <iframe
                  title="Google Maps Location"
                  src={settings.contactMapEmbed}
                  className="w-full h-full absolute inset-0 border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
};

export default ContactPage;
