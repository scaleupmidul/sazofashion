
import React, { memo } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Music2 as Tiktok, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';

const Footer: React.FC = () => {
    const navigate = useAppStore(state => state.navigate);
    const { footerDescription, socialMediaLinks, contactAddress, contactPhone, contactEmail, footerEmail, categories, pausedCategories } = useAppStore(state => ({
        footerDescription: state.settings.footerDescription,
        socialMediaLinks: state.settings.socialMediaLinks,
        contactAddress: state.settings.contactAddress,
        contactPhone: state.settings.contactPhone,
        contactEmail: state.settings.contactEmail,
        footerEmail: state.settings.footerEmail,
        categories: state.settings.categories || [],
        pausedCategories: state.settings.pausedCategories || [],
    }));

    const activeCategories = categories.filter((cat: string) => !pausedCategories.includes(cat));

    const socialIcons: { [key: string]: React.ElementType } = {
        Facebook: Facebook,
        Instagram: Instagram,
        Twitter: Twitter,
        Youtube: Youtube,
        YouTube: Youtube,
        Linkedin: Linkedin,
        LinkedIn: Linkedin,
        TikTok: Tiktok,
        Tiktok: Tiktok,
    };

    const validSocialLinks = (socialMediaLinks || []).filter(link => link.url && link.url.trim() !== '' && link.url.trim() !== '#');

    const [newsletterEmail, setNewsletterEmail] = React.useState('');
    const [isSubscribing, setIsSubscribing] = React.useState(false);
    const addContactMessage = useAppStore(state => state.addContactMessage);
    const notify = useAppStore(state => state.notify);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newsletterEmail) return;
        setIsSubscribing(true);
        try {
            await addContactMessage({
                name: 'Newsletter Subscriber',
                email: newsletterEmail,
                message: 'New subscription request from footer newsletter form.'
            });
            notify('Thank you for joining our private circle.', 'success');
            setNewsletterEmail('');
        } catch (error) {
            notify('Unable to subscribe at this time.', 'error');
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
      <footer className="bg-brand-charcoal text-white pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="container-luxury">
            
            {/* Newsletter Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 pb-16 border-b border-white/5 items-end">
                <div>
                    <span className="text-[11px] lg:text-[12px] font-sans font-bold text-brand-accent uppercase tracking-[0.3em] mb-4 block">Newsletter</span>
                    <h3 className="font-serif text-3xl md:text-5xl font-light italic leading-tight">Subscribe to the <br />Private Circle</h3>
                </div>
                <div className="w-full">
                    <form onSubmit={handleNewsletterSubmit} className="relative group max-w-md lg:ml-auto">
                        <input 
                            type="email" 
                            required
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            placeholder="YOUR EMAIL IDENTITY" 
                            className="bg-transparent border-b border-white/10 w-full py-4 pl-4 pr-12 focus:border-brand-accent transition-all duration-700 outline-none text-[10px] lg:text-[11px] font-display font-bold tracking-[0.4em] uppercase placeholder:text-white/40"
                        />
                        <button 
                            type="submit"
                            disabled={isSubscribing}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 group-hover:px-4 transition-all duration-500 text-brand-accent disabled:opacity-50"
                        >
                            {isSubscribing ? <span className="animate-pulse">...</span> : <ArrowRight size={20} strokeWidth={1} />}
                        </button>
                    </form>
                    <p className="mt-4 text-[10px] text-white/30 uppercase tracking-[0.1em] lg:text-right">In subscribing, you agree to our privacy protocols.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 md:gap-16 mb-16">
                {/* Brand Info */}
                <div className="lg:col-span-5">
                    <h2 onClick={() => navigate('/')} className="font-sans text-3xl md:text-4xl font-black text-white tracking-tight mb-8 cursor-pointer uppercase">SAZO<span className="inline-block w-[0.18em] h-[0.18em] rounded-full bg-brand-accent align-baseline"></span>FASHION</h2>
                    <p className="text-white/70 text-[12px] leading-relaxed tracking-wider mb-10 max-w-sm font-light whitespace-pre-wrap">
                        {footerDescription || 'Luxury essentials designed for the modern matriarch. Embracing quality, sustainability, and timeless elegance in every thread.'}
                    </p>
                    <div className="flex space-x-8">
                        {validSocialLinks.map(link => {
                            const Icon = socialIcons[link.platform];
                            return Icon ? (
                                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-brand-accent transition-all duration-500">
                                    <Icon size={18} strokeWidth={1} />
                                </a>
                            ) : null;
                        })}
                    </div>
                </div>

                {/* Sub-Navigation */}
                <div className="lg:col-span-2">
                    <h4 className="text-[11px] lg:text-[12px] font-sans font-bold uppercase tracking-[0.2em] mb-8 text-white/50">Collections</h4>
                    <nav className="flex flex-col space-y-4 text-[11px] lg:text-[12px] font-sans font-semibold uppercase tracking-[0.1em]">
                        <button onClick={() => navigate('/shop')} className="hover:text-brand-accent transition-all duration-500 text-left">The Collection</button>
                        {activeCategories.map((cat: string) => (
                            <button 
                                key={cat}
                                onClick={() => navigate(`/category/${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, '-'))}`)} 
                                className="hover:text-brand-accent transition-all duration-500 text-left"
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="lg:col-span-2">
                    <h4 className="text-[11px] lg:text-[12px] font-sans font-bold uppercase tracking-[0.2em] mb-8 text-white/50">Maison</h4>
                    <nav className="flex flex-col space-y-4 text-[11px] lg:text-[12px] font-sans font-semibold uppercase tracking-[0.1em]">
                        <button onClick={() => navigate('/about')} className="hover:text-brand-accent transition-all duration-500 text-left">Our Evolution</button>
                        <button onClick={() => navigate('/contact')} className="hover:text-brand-accent transition-all duration-500 text-left">Concierge</button>
                        <button onClick={() => navigate('/policy')} className="hover:text-brand-accent transition-all duration-500 text-left">Privacy Policy</button>
                    </nav>
                </div>

                {/* Contact */}
                <div className="lg:col-span-3">
                    <h4 className="text-[11px] lg:text-[12px] font-sans font-bold uppercase tracking-[0.2em] mb-8 text-white/50">Presence</h4>
                    <div className="space-y-4 text-[11px] lg:text-[12px] font-sans font-medium uppercase tracking-[0.1em] text-white/80 leading-loose whitespace-pre-wrap">
                        {contactAddress && <p className="leading-relaxed">{contactAddress}</p>}
                        {contactPhone && <p className="hover:text-brand-accent transition-colors cursor-pointer">{contactPhone}</p>}
                        {(footerEmail || contactEmail) && (
                            <a 
                                href={`mailto:${footerEmail || contactEmail}`}
                                className="block hover:text-brand-accent transition-colors cursor-pointer break-all"
                            >
                                {footerEmail || contactEmail}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-white/5 flex justify-center">
                <p className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-white/20">
                    &copy; {new Date().getFullYear()} SAZO. All rights reserved.
                </p>
            </div>
        </div>
      </footer>
    );
};

export default memo(Footer);
