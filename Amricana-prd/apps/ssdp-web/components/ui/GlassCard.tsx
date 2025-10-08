// NEURAL: Glass morphism card component
import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const GlassCard: FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  onClick
}) => {
  const baseStyles = 'rounded-2xl backdrop-blur-xl border transition-all duration-300';
  const glassStyles = gradient
    ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
    : 'bg-white/10 border-white/20';
  const hoverStyles = hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-2xl cursor-pointer' : '';

  const cardClassName = clsx(
    baseStyles,
    glassStyles,
    hoverStyles,
    className
  );

  if (onClick) {
    return (
      <motion.div
        className={cardClassName}
        onClick={onClick}
        whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cardClassName}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
