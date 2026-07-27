
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ProgressBarProps {
  isNavigating: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isNavigating }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isNavigating) {
      setIsVisible(true);
      setProgress(0);
      
      // Mimic progress with luxury easing
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const jump = Math.random() * 20;
          return Math.min(prev + jump, 95);
        });
      }, 150);
    } else {
      setProgress(100);
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 400);
      return () => {
          clearTimeout(fadeTimer);
          if (timer) clearInterval(timer);
      };
    }
    
    return () => clearInterval(timer);
  }, [isNavigating]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.2 }}
           className="fixed top-0 left-0 right-0 z-[10000] h-[3px] pointer-events-none"
        >
          <motion.div 
            className="h-full bg-brand-accent shadow-[0_0_15px_rgba(208,168,103,0.8)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ 
                type: 'spring', 
                stiffness: progress === 100 ? 80 : 30, 
                damping: 15,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressBar;
