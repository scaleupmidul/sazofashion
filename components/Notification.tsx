import React, { useEffect } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType | null;
}

const playErrorSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(360, now);
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(280, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(150, now + 0.28);
    
    gain2.gain.setValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(now + 0.1);
    osc2.stop(now + 0.3);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 400);
  } catch {
    // Autoplay policy or browser audio context unavailable
  }
};

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  useEffect(() => {
    if (notification && notification.type === 'error') {
      playErrorSound();
    }
  }, [notification]);

  if (!notification) return null;

  const config = {
    success: {
      icon: Check,
      bgClass: 'bg-emerald-50',
      iconClass: 'text-emerald-600',
      labelClass: 'text-emerald-700',
      messageClass: 'text-emerald-900',
      label: 'Success'
    },
    error: {
      icon: AlertCircle,
      bgClass: 'bg-rose-50',
      iconClass: 'text-rose-600',
      labelClass: 'text-rose-700',
      messageClass: 'text-stone-800',
      label: 'Error'
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      labelClass: 'text-blue-700',
      messageClass: 'text-stone-800',
      label: 'Info'
    }
  };

  const { icon: Icon, bgClass, iconClass, labelClass, label, messageClass } = config[notification.type];

  return (
    <div className="fixed top-3 sm:top-5 left-1/2 transform -translate-x-1/2 z-[1000] animate-notification w-[90vw] max-w-[320px]">
      <div className="flex items-start gap-2.5 p-2.5 bg-white/95 backdrop-blur-xl border border-stone-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-xl">
        
        {/* Compact Icon - Aligned to start */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgClass} ${iconClass} flex-shrink-0 mt-0.5`}>
          <Icon size={16} strokeWidth={3} />
        </div>

        {/* Compact Text Content - Allowed to wrap */}
        <div className="flex flex-col justify-center min-w-0 py-0.5">
           <span className={`text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1.5 ${labelClass}`}>
             {label}
           </span>
           
           <span className={`text-xs font-bold leading-tight ${messageClass}`}>
             {notification.message}
           </span>
        </div>

      </div>
      
      <style>{`
        @keyframes notification-in {
          0% { transform: translate(-50%, -120%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-notification {
          animation: notification-in 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards;
        }
      `}</style>
    </div>
  );
};

export default Notification;