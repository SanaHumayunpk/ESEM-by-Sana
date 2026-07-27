import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Droplets, HeartHandshake } from 'lucide-react';

interface BrandedLoadingOverlayProps {
  title: string;
  subtitle?: string;
  icon?: 'sparkles' | 'droplet' | 'care';
}

export const BrandedLoadingOverlay: React.FC<BrandedLoadingOverlayProps> = ({
  title,
  subtitle,
  icon = 'sparkles',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-3xl max-w-sm w-full p-7 text-center space-y-5 shadow-2xl border border-rose-100/80 overflow-hidden relative"
      >
        {/* Animated Background Aura */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-rose-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* Pulsing Skincare-themed Icon Container */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          {/* Ripple Ring 1 */}
          <motion.div
            animate={{
              scale: [1, 1.45, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-emerald-200/50 border border-emerald-400/40"
          />

          {/* Ripple Ring 2 */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-1 rounded-full bg-rose-100/60 border border-rose-300/40"
          />

          {/* Core Icon Badge */}
          <motion.div
            animate={{
              scale: [0.96, 1.04, 0.96],
              rotate: [0, 4, -4, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white shadow-md flex items-center justify-center"
          >
            {icon === 'droplet' ? (
              <Droplets className="w-7 h-7 text-emerald-200" />
            ) : icon === 'care' ? (
              <HeartHandshake className="w-7 h-7 text-rose-200" />
            ) : (
              <Sparkles className="w-7 h-7 text-emerald-200" />
            )}
          </motion.div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5 relative z-10">
          <h3 className="font-serif text-lg font-semibold text-slate-800">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 min-h-[36px] flex items-center justify-center px-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Shimmer Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="bg-gradient-to-r from-emerald-500 via-rose-400 to-emerald-600 h-full w-1/2 rounded-full shadow-2xs"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
