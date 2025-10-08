// NEURAL: Animated mesh gradient background with 60% wireframe overlay
import { FC, ReactNode } from 'react';
import clsx from 'clsx';

interface MeshGradientProps {
  children?: ReactNode;
  className?: string;
  animated?: boolean;
}

export const MeshGradient: FC<MeshGradientProps> = ({
  children,
  className = '',
  animated = true
}) => {
  return (
    <div
      className={clsx(
        'relative',
        animated ? 'brainsait-mesh-animated' : 'brainsait-mesh',
        className
      )}
    >
      {children}
    </div>
  );
};
