
import React from 'react';
import { useAppStore } from '../store';
import { Home, ShoppingBag, Search, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const MobileNavigation: React.FC = () => {
    const path = useAppStore(state => state.path);
    const navigate = useAppStore(state => state.navigate);
    
    // Don't show on admin or checkout pages to reduce clutter
    if (path.startsWith('/admin') || path === '/checkout') return null;

    const navItems = [
        { icon: Home, label: 'Home', target: '/' },
        { icon: ShoppingBag, label: 'Shop', target: '/shop' },
        { icon: Search, label: 'Search', target: '/shop?search=true' }, // Placeholder for search focus
        { icon: Heart, label: 'Wishlist', target: '/cart' }, // Reusing cart as a simplified wishlist for this context
        { icon: User, label: 'Account', target: '/cart' }, // Simple redirect to cart/contact
    ];

    return (
        <div className="md:hidden mobile-bottom-nav">
            {navItems.map((item) => {
                const isActive = path === item.target;
                return (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.target)}
                        className={`nav-link-mobile ${isActive ? 'active' : ''}`}
                    >
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="relative p-1"
                        >
                            <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-accent rounded-full"
                                />
                            )}
                        </motion.div>
                        <span className="font-display tracking-widest">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default MobileNavigation;
