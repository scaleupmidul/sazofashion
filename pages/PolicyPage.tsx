import React from 'react';
import { useAppStore } from '../store';
import { Skeleton, TextSkeleton } from '../components/Skeleton';
import { motion } from 'motion/react';

const PolicyPageSkeleton: React.FC = () => (
    <main className="max-w-[1750px] mx-auto px-6 sm:px-12 lg:px-24 pt-32 sm:pt-48 pb-20">
        <div className="flex flex-col items-center mb-16 text-center">
            <Skeleton className="h-3 w-32 mb-6" />
            <Skeleton className="h-12 w-64 mb-10" />
        </div>
        <div className="max-w-4xl mx-auto space-y-12 bg-[#fcf8f6]/50 p-8 sm:p-16 rounded-[2rem] border border-stone-100/80">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <TextSkeleton rows={4} />
                </div>
            ))}
        </div>
    </main>
);

const PolicyPage: React.FC = () => {
  const { settings, loading } = useAppStore();

  if (loading) {
      return <PolicyPageSkeleton />;
  }

  const policyText = settings.privacyPolicy?.replace('{{CONTACT_EMAIL}}', settings.contactEmail || '') || '';

  return (
    <main className="max-w-[1750px] mx-auto px-4 sm:px-12 lg:px-24 pt-20 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-12 sm:mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 sm:mb-6"
          >
            Maison Protocols
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl font-serif italic text-stone-900"
          >
            Privacy Policy
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 sm:mt-10 text-brand-muted text-xs sm:text-sm uppercase tracking-widest leading-loose max-w-xl mx-auto px-4"
          >
            Your trust is our most precious asset. Below, we outline our strict commitments to safeguarding your personal identity and shopping information.
          </motion.p>
      </div>

      {/* Policy Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto bg-[#fcf8f6]/50 p-6 sm:p-12 lg:p-16 rounded-[2rem] border border-stone-100 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 whitespace-pre-wrap leading-relaxed font-sans text-stone-700 text-xs sm:text-sm md:text-base tracking-wide space-y-6">
          {policyText}
        </div>
      </motion.div>
    </main>
  );
};

export default PolicyPage;
