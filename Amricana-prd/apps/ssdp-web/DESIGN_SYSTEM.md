# BrainSAIT SSDP Design System

## Color Palette

### Primary Colors

#### Sweet Amber (#ea580c)
- **Usage**: Primary actions, CTAs, highlights
- **Tailwind**: `amber-600`
- **CSS Variable**: `--sweet-amber`
- **Purpose**: Energy, warmth, and action

#### Royal Midnight (#1a365d)
- **Usage**: Headers, navigation, primary text
- **Tailwind**: `midnight-900`
- **CSS Variable**: `--royal-midnight`
- **Purpose**: Trust, professionalism, authority

#### Fresh Mint (#0ea5e9)
- **Usage**: Accents, links, highlights
- **Tailwind**: `mint-500`
- **CSS Variable**: `--fresh-mint`
- **Purpose**: Innovation, clarity, modern feel

### Supporting Colors

#### Oasis Green (#10b981)
- **Usage**: Success states, positive feedback
- **Tailwind**: `oasis-500`
- **CSS Variable**: `--oasis-green`
- **Purpose**: Growth, success, approval

#### Desert Gold (#f59e0b)
- **Usage**: Warnings, alerts, caution states
- **Tailwind**: `gold-500`
- **CSS Variable**: `--desert-gold`
- **Purpose**: Attention, caution, important information

#### Sandstone Gray (#64748b)
- **Usage**: Neutral elements, borders, disabled states
- **Tailwind**: `sandstone-500`
- **CSS Variable**: `--sandstone-gray`
- **Purpose**: Balance, neutrality, subtle elements

## Glass Morphism

### Usage
```tsx
import { GlassCard } from '@/components/ui';

<GlassCard hover gradient>
  <p>Your content here</p>
</GlassCard>
```

### CSS Classes
- `.brainsait-glass`: Standard glass effect
- `.glass`: Utility class for glass morphism
- `.glass-dark`: Dark mode glass effect

### Properties
- **Background**: Semi-transparent white (10% opacity)
- **Backdrop Filter**: 20px blur
- **Border**: Semi-transparent white (20% opacity)
- **Shadow**: Soft shadow for depth

## Mesh Gradients

### Standard Mesh Gradient
```tsx
import { MeshGradient } from '@/components/ui';

<MeshGradient>
  <p>Content with mesh background</p>
</MeshGradient>
```

### Features
- **60% Wireframe Overlay**: Subtle grid pattern for depth
- **Animated**: Smooth gradient movement
- **Colors**: Royal Midnight, Sweet Amber, Fresh Mint
- **Fixed Background**: Parallax-like effect on scroll

### CSS Classes
- `.brainsait-mesh`: Static mesh gradient
- `.brainsait-mesh-animated`: Animated mesh gradient
- `.brainsait-gradient`: Simple linear gradient

## Bilingual Support

### i18n Configuration
The app uses `react-i18next` for internationalization with:
- **Default Language**: Arabic (ar)
- **Fallback Language**: English (en)
- **Auto RTL**: Automatic right-to-left layout for Arabic

### BilingualText Component
```tsx
import { BilingualText } from '@/components/ui';

<BilingualText 
  as="h1"
  ar="مرحباً"
  en="Welcome"
  className="text-2xl"
/>
```

### RTL/LTR Layout
The app automatically adjusts:
- Text direction (RTL for Arabic, LTR for English)
- Font family (Noto Sans Arabic for Arabic, Inter for English)
- Layout spacing and alignment

### Translation Usage
```tsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

<p>{t('common.dashboard')}</p>
```

## Typography

### Font Families
- **Arabic**: Noto Sans Arabic (font-noto)
- **English**: Inter (font-inter)
- **Display**: Manrope (font-manrope)

### Hierarchy
- **Heading**: `.brainsait-heading` - Bold, tight letter-spacing
- **Body**: `.brainsait-body` - Regular, comfortable line-height

## Buttons

### Button Styles
```tsx
<button className="brainsait-btn brainsait-btn-primary">
  Primary Action
</button>

<button className="brainsait-btn brainsait-btn-secondary">
  Secondary Action
</button>

<button className="brainsait-btn brainsait-btn-success">
  Success Action
</button>

<button className="brainsait-btn brainsait-btn-ghost">
  Ghost Action
</button>
```

### Button Classes
- `.brainsait-btn`: Base button styles
- `.brainsait-btn-primary`: Sweet Amber background
- `.brainsait-btn-secondary`: Royal Midnight background
- `.brainsait-btn-success`: Oasis Green background
- `.brainsait-btn-ghost`: Transparent with hover effect

## Animations

### Built-in Animations
- `fade-in`: Smooth fade-in effect
- `slide-up`: Slide up with fade
- `pulse-slow`: Slow pulsing effect
- `live-pulse`: Live indicator pulse
- `meshMove`: Mesh gradient animation

### Usage
```tsx
<div className="animate-fade-in">
  Fading in content
</div>

<div className="animate-live-pulse">
  Live indicator
</div>
```

## Dark Mode

### Implementation
The design system supports dark mode with automatic color adjustments:
- Glass morphism adapts to dark backgrounds
- Button colors maintain contrast
- Text remains readable

### Usage
```tsx
<div className="dark:bg-midnight-900 dark:text-white">
  Content adapts to dark mode
</div>
```

## Accessibility

### Features
- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard support
- **High Contrast**: Colors meet WCAG AA standards
- **Reduced Motion**: Respects prefers-reduced-motion
- **Screen Reader**: Semantic HTML and proper structure

## Best Practices

1. **Use Glass Cards**: For elevated content sections
2. **Apply Mesh Gradients**: For hero sections and backgrounds
3. **Maintain Hierarchy**: Use color palette consistently
4. **Test Both Languages**: Always verify Arabic and English
5. **Check RTL Layout**: Ensure proper spacing and alignment
6. **Animate Subtly**: Keep animations smooth and purposeful
7. **Optimize Performance**: Use backdrop-filter sparingly on mobile
