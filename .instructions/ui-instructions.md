---
applyTo:
  - "**/components/**"
  - "**/ui/**"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/pages/**"
  - "**/app/**"
---

# UI Component Implementation Instructions

## Overview
All UI components must follow BrainSAIT design system with glass morphism, mesh gradients, and bilingual support (Arabic/English).

## BrainSAIT Design System

### Colors
\`\`\`typescript
// NEURAL: Official BrainSAIT color palette
export const colors = {
  // Primary palette
  midnightBlue: '#1a365d',
  medicalBlue: '#2b6cb8',
  signalTeal: '#0ea5e9',
  deepOrange: '#ea580c',
  professionalGray: '#64748b',
  
  // Accent colors
  accentPurple: '#7c3aed',
  accentViolet: '#8b5cf6',
  
  // Background
  backgroundBlack: '#000000',
  backgroundDark: '#0f172a',
  
  // Text
  textWhite: '#ffffff',
  textLight: '#e2e8f0',
  textMuted: '#94a3b8',
  
  // Glass morphism overlays
  glassLight: 'rgba(255, 255, 255, 0.1)',
  glassMedium: 'rgba(255, 255, 255, 0.15)',
  glassDark: 'rgba(0, 0, 0, 0.2)',
} as const;
\`\`\`

### Required Component Structure

\`\`\`typescript
// NEURAL: Standard BrainSAIT component pattern
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { auditLogger } from '@/lib/audit';

interface ComponentProps {
  userRole: 'admin' | 'provider' | 'patient' | 'auditor';
  bilingualContent?: {
    en: string;
    ar: string;
  };
  children?: ReactNode;
  className?: string;
}

export const BrainSAITComponent: FC<ComponentProps> = ({
  userRole,
  bilingualContent,
  children,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const { validateAccess } = useAuth();
  const isRTL = i18n.language === 'ar';
  
  // BRAINSAIT: Validate user access
  if (!validateAccess(userRole, 'read:component_data')) {
    auditLogger.logAccessDenied({
      component: 'BrainSAITComponent',
      userRole,
      timestamp: new Date()
    });
    return <UnauthorizedView />;
  }
  
  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={\`brainsait-component \${className}\`}
    >
      {children}
    </div>
  );
};
\`\`\`

### Glass Morphism Card Component


### Bilingual Text Component

```typescript
// BILINGUAL: Auto-switching text component
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface BilingualTextProps {
  translationKey: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  fallback?: string;
}

export const BilingualText: FC<BilingualTextProps> = ({
  translationKey,
  as: Component = 'p',
  className = '',
  fallback = '',
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const isArabic = i18n.language === 'ar';

  return (
    <Component
      dir={isRTL ? 'rtl' : 'ltr'}
      className={clsx(
        // Font family based on language
        isArabic ? 'font-arabic' : 'font-english',
        
        // Text alignment
        isRTL ? 'text-right' : 'text-left',
        
        // Custom classes
        className
      )}
    >
      {t(translationKey, fallback)}
    </Component>
  );
};
```

### Animation Standards

```typescript
// NEURAL: Standard page transition variants
import { Variants } from 'framer-motion';

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};
```

### RTL Layout Support

```typescript
// BILINGUAL: RTL-aware utility functions
export const getRTLSpacing = (isRTL: boolean) => ({
  marginStart: isRTL ? 'mr' : 'ml',
  marginEnd: isRTL ? 'ml' : 'mr',
  paddingStart: isRTL ? 'pr' : 'pl',
  paddingEnd: isRTL ? 'pl' : 'pr',
  start: isRTL ? 'right' : 'left',
  end: isRTL ? 'left' : 'right',
});
```

## Component Checklist

Before committing UI components:

- [ ] Follows BrainSAIT color palette
- [ ] Includes glass morphism styling
- [ ] Supports RTL/LTR layouts
- [ ] Has bilingual text support
- [ ] Includes role-based access control
- [ ] Logs sensitive data access (audit)
- [ ] Animations run at 60 FPS
- [ ] Keyboard accessible
- [ ] ARIA labels present
- [ ] Mobile responsive
- [ ] Dark mode compatible

---

**Remember:** Every UI component may display PHI. Always implement access controls and audit logging.
