import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
}

export function GlassButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: GlassButtonProps) {
  const base =
    'relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]';

  const variants = {
    primary:
      'border border-accent-cyan/20 bg-accent-cyan text-white shadow-sm hover:bg-[#0891b2] active:bg-[#0e7490]',
    ghost:
      'border border-border bg-surface text-text-secondary hover:border-accent-purple/40 hover:bg-surface-elevated hover:text-text',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
