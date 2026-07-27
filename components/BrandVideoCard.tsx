import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, X, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BrandVideoCardProps {
  videoUrl?: string;
  mobileVideoUrl?: string;
  title?: string;
  subtitle?: string;
  posterImage?: string;
  mobilePosterImage?: string;
  className?: string;
}

export const BrandVideoCard: React.FC<BrandVideoCardProps> = ({
  videoUrl = '',
  mobileVideoUrl = '',
  title = 'Sazo Couture',
  subtitle = 'Behind The Scenes',
  posterImage,
  mobilePosterImage,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeVideoUrl = isMobile && mobileVideoUrl ? mobileVideoUrl : (videoUrl || mobileVideoUrl);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [activeVideoUrl, isMuted]);

  const activePoster = isMobile 
    ? (mobilePosterImage || posterImage) 
    : (posterImage || mobilePosterImage);

  const isYouTube = activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be');

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeId(url);
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3`;
  };

  const getYouTubeModalUrl = (url: string) => {
    const videoId = getYouTubeId(url);
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&iv_load_policy=3`;
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`group relative h-[380px] sm:h-[450px] overflow-hidden cursor-pointer bg-stone-900 ${className}`}
      >
        {activeVideoUrl ? (
          isYouTube ? (
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center bg-stone-900">
              <iframe
                src={getYouTubeEmbedUrl(activeVideoUrl)}
                title={title}
                className="w-[180%] h-[180%] min-w-[180%] min-h-[180%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={activeVideoUrl}
              poster={activePoster}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
            />
          )
        ) : activePoster ? (
          <img 
            src={activePoster} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-stone-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-opacity duration-500 group-hover:from-black/95" />

        {/* Top Controls */}
        <div className="absolute top-6 right-6 flex items-center justify-end z-20">
          {!isYouTube && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={togglePlay}
                className="p-2 bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Play Icon Center Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl group-hover:bg-brand-accent group-hover:border-brand-accent group-hover:text-black transition-all duration-500"
          >
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          </motion.div>
        </div>

        {/* Bottom Content */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white z-20">
          <span className="text-[10px] font-sans font-medium uppercase tracking-[0.25em] text-amber-200/90 mb-1.5">
            {subtitle}
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif italic text-white tracking-wide mb-3 transition-transform duration-500 group-hover:translate-x-1">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-white/80 group-hover:text-brand-accent transition-colors duration-300">
            <span className="relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-accent group-hover:after:w-full after:transition-all after:duration-300">Watch Full Screen</span>
            <Maximize2 className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
      </div>

      {/* Fullscreen Modal Video Player */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8"
            onClick={() => setIsModalOpen(false)}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors rounded-none z-50 border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video bg-black overflow-hidden shadow-2xl border border-stone-800"
              onClick={(e) => e.stopPropagation()}
            >
              {isYouTube ? (
                <iframe
                  src={getYouTubeModalUrl(activeVideoUrl)}
                  title={title}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideoUrl}
                  poster={activePoster}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandVideoCard;
