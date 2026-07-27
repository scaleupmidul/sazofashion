
// components/HeroSlider.tsx

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useAppStore } from '../store';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import AmbientParticleCanvas from './AmbientParticleCanvas';

const HeroImage: React.FC<{ 
    src: string; 
    alt: string; 
    scrollYProgress: any; 
    onLoad: () => void;
    isActive: boolean;
}> = ({ src, alt, scrollYProgress, onLoad, isActive }) => {
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoaded(false);
        setError(false);
    }, [src]);

    const hasImage = !!src && typeof src === 'string' && src.trim() !== '';

    if (!hasImage || error) {
        return (
            <div className="absolute inset-0 bg-[#f3f0ea]/70 backdrop-blur-md flex items-center justify-center overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#C38B7C]/10 filter blur-3xl animate-[pulse_6s_infinite_ease-in-out]" />
                <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-[#1A1A1A]/5 filter blur-2xl animate-[pulse_4s_infinite_ease-in-out_1s]" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 overflow-hidden bg-[#f3f0ea]">
            {!loaded && (
                <div className="absolute inset-0 bg-[#f3f0ea]/70 backdrop-blur-md flex items-center justify-center z-10">
                    <div className="w-full h-full bg-gradient-to-r from-stone-100 via-stone-200/50 to-stone-100 bg-[length:200%_100%] animate-pulse" />
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#C38B7C]/10 filter blur-3xl animate-[pulse_4s_infinite]" />
                </div>
            )}
            <motion.img
                initial={{ opacity: 0 }}
                animate={{ 
                    opacity: loaded ? 1 : 0 
                }}
                style={{ y, willChange: 'transform' }}
                transition={{ 
                    opacity: { duration: 1.8, ease: "easeOut" }
                }}
                src={src}
                alt={alt}
                onLoad={() => {
                    setLoaded(true);
                    onLoad();
                }}
                onError={() => setError(true)}
                className="object-cover w-full h-full block"
            />
        </div>
    );
};

const HeroSlider: React.FC = () => {
    const navigate = useAppStore(state => state.navigate);
    const { sliderImages, showSliderText } = useAppStore(state => ({
        sliderImages: state.settings.sliderImages,
        showSliderText: state.settings.showSliderText ?? true
    }));
    const loading = useAppStore(state => state.loading);
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [prevSlide, setPrevSlide] = useState<number | null>(null);
    const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const prev = currentSlide;
        return () => {
            setPrevSlide(prev);
        };
    }, [currentSlide]);
    
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const slides = Array.isArray(sliderImages) ? sliderImages : [];
    const totalSlides = slides.length;

    const nextSlide = useCallback(() => {
        if (totalSlides > 0) {
            setCurrentSlide(prev => (prev + 1) % totalSlides);
        }
    }, [totalSlides]);

    useEffect(() => {
        const slideTimer = setInterval(nextSlide, 8000); 
        return () => clearInterval(slideTimer);
    }, [nextSlide]);

    const handleImageLoad = (index: number) => {
        setLoadedSlides(prev => ({...prev, [index]: true}));
    }

    if (totalSlides === 0 && loading) {
        return (
            <section ref={containerRef} className="relative w-full aspect-[4/3] sm:aspect-[16/7] lg:aspect-[16/6] bg-stone-100 animate-pulse"></section>
        );
    }
    
    if (totalSlides === 0) {
        return (
            <section ref={containerRef} className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center bg-brand-offwhite">
                <div className="text-center px-6">
                    <span className="text-xs font-display font-medium text-brand-accent uppercase tracking-[0.4em] mb-4 block">Welcome to SAZO</span>
                    <h2 className="text-4xl md:text-7xl font-serif text-brand-charcoal mb-8">Crafting Memories <br /> <span className="italic">through Fabric</span></h2>
                    <button 
                        onClick={() => navigate('/shop')}
                        className="luxury-button"
                    >
                        Explore Our Curation
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section ref={containerRef} className="relative w-full h-[75vh] md:h-[85vh] lg:h-[95vh] bg-[#f3f0ea] overflow-hidden">
            {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                const isPrev = index === prevSlide;
                
                // Active slide goes on top (zIndex: 10). Previous slide stays right below it (zIndex: 5).
                // All other slides are placed at the bottom (zIndex: 0).
                let zIndex = 0;
                if (isActive) zIndex = 10;
                else if (isPrev) zIndex = 5;

                const activeImage = isMobile && slide.mobileImage ? slide.mobileImage : (slide.image || slide.mobileImage || '');

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : (isPrev ? 0 : 0) }}
                        transition={{ 
                            duration: 2.2, 
                            ease: [0.25, 0.1, 0.25, 1.0] // Very gentle, classic slow crossfade
                        }}
                        className="absolute inset-0"
                        style={{ 
                            pointerEvents: isActive ? 'auto' : 'none', 
                            zIndex,
                            willChange: 'opacity'
                        }}
                    >
                        <HeroImage 
                            src={activeImage} 
                            alt={slide.title} 
                            scrollYProgress={scrollYProgress}
                            onLoad={() => handleImageLoad(index)} 
                            isActive={isActive}
                        />
                        <div className={`absolute inset-0 transition-colors duration-700 ${showSliderText ? 'bg-black/40' : 'bg-transparent'}`}></div>
                        
                        {showSliderText && (
                            <motion.div 
                                style={{ opacity }}
                                animate={{ opacity: isActive ? 1 : 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12 z-20"
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ 
                                        opacity: isActive ? 1 : 0, 
                                        y: isActive ? 0 : -10 
                                    }}
                                    transition={{ duration: 1.4, delay: isActive ? 0.4 : 0, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-white font-display font-bold uppercase tracking-[0.4em] text-[9px] md:text-[11px] mb-8"
                                >
                                    {slide.subtitle || "The New Era of Luxury"}
                                </motion.span>
                                
                                <motion.h2 
                                    initial={{ opacity: 0, y: 25 }}
                                    animate={{ 
                                        opacity: isActive ? 1 : 0, 
                                        y: isActive ? 0 : -15 
                                    }}
                                    transition={{ duration: 1.6, delay: isActive ? 0.6 : 0, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-4xl md:text-6xl lg:text-8xl font-serif text-white leading-[0.95] mb-12"
                                >
                                    {slide.title}
                                </motion.h2>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ 
                                        opacity: isActive ? 1 : 0, 
                                        y: isActive ? 0 : -10 
                                    }}
                                    transition={{ duration: 1.4, delay: isActive ? 0.8 : 0, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <button
                                        onClick={() => navigate('/shop')}
                                        className="luxury-button !bg-white !text-brand-charcoal hover:!bg-brand-accent hover:!text-white"
                                    >
                                        Explore Collection
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}

            {/* Ambient Particle Overlay */}
            <AmbientParticleCanvas 
                moteCount={40}
                fiberCount={14}
                className="absolute inset-0 pointer-events-none z-10"
                speedMultiplier={0.5}
                particleColor="244, 230, 218"
                glowColor="255, 248, 240"
            />
            
            {/* Minimal Indicators */}
            <div className="absolute bottom-12 left-0 w-full flex justify-center items-center gap-4 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className="p-2 group"
                    >
                        <div className={`h-[1px] transition-all duration-1000 ease-in-out ${index === currentSlide ? 'w-16 bg-white' : 'w-6 bg-white/40 group-hover:bg-white/80'}`}></div>
                    </button>
                ))}
            </div>
            
            {/* Side numbers (Desktop) */}
            <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-4 text-white font-serif italic text-lg z-30 opacity-50">
                <span>0{currentSlide + 1}</span>
                <div className="w-[1px] h-20 bg-white/30"></div>
                <span>0{totalSlides}</span>
            </div>
        </section>
    );
};

export default memo(HeroSlider);
