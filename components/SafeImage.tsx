import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  className?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className = '', ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Synchronously reset loading and error state when the src prop changes.
  // This avoids asynchronous race conditions where onLoad fires before useEffect resets the state.
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
    setError(false);
  }

  const hasImage = !!src && typeof src === 'string' && src.trim() !== '';

  if (!hasImage || error) {
    return (
      <div 
        id="safe-image-placeholder"
        className={`w-full h-full bg-[#f3f0ea]/70 backdrop-blur-md flex items-center justify-center relative overflow-hidden ${className}`}
      >
        {/* Abstract luxury ambient shapes inside the blur container to create a stunning minimalist placeholder */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#C38B7C]/10 filter blur-2xl animate-[pulse_6s_infinite_ease-in-out]" />
        <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-[#1A1A1A]/5 filter blur-xl animate-[pulse_4s_infinite_ease-in-out_1s]" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} id="safe-image-container">
      {/* Blurred shimmer loading screen */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#f3f0ea]/70 backdrop-blur-md flex items-center justify-center z-10" id="safe-image-shimmer">
          <div className="w-full h-full bg-gradient-to-r from-stone-100 via-stone-200/50 to-stone-100 bg-[length:200%_100%] animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#C38B7C]/10 filter blur-2xl animate-[pulse_4s_infinite]" />
        </div>
      )}
      <img
        key={src} // Forces recreation of the img element to guarantee onLoad triggers reliably even if the image is in browser cache
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-all duration-[1.2s] ease-out ${loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'}`}
        {...props}
      />
    </div>
  );
};

export default SafeImage;
