// BILINGUAL: Auto-switching text component
import { FC, ReactNode } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

interface BilingualTextProps {
  children?: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  ar?: string;
  en?: string;
}

export const BilingualText: FC<BilingualTextProps> = ({
  children,
  as: Component = 'p',
  className = '',
  ar,
  en
}) => {
  const router = useRouter();
  const isRTL = router.locale === 'ar';
  const isArabic = router.locale === 'ar';

  // If ar/en props are provided, use them based on locale
  const content = ar && en ? (isArabic ? ar : en) : children;

  return (
    <Component
      dir={isRTL ? 'rtl' : 'ltr'}
      className={clsx(
        // Font family based on language
        isArabic ? 'font-noto' : 'font-inter',
        // Text alignment
        isRTL ? 'text-right' : 'text-left',
        // Custom classes
        className
      )}
    >
      {content}
    </Component>
  );
};
