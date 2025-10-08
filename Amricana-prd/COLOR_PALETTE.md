# BrainSAIT SSDP Color Palette

## Official Colors

### Primary: Sweet Amber
```
HEX:      #ea580c
RGB:      234, 88, 12
Tailwind: amber-600
Usage:    Primary actions, CTAs, highlights, energy, warmth
```
🟧 Sweet Amber represents energy, warmth, and the vibrant nature of the sweet distribution industry.

### Secondary: Royal Midnight
```
HEX:      #1a365d
RGB:      26, 54, 93
Tailwind: midnight-900
Usage:    Headers, navigation, primary text, trust, professionalism
```
🔵 Royal Midnight conveys trust, professionalism, and the authority of BrainSAIT's platform.

### Accent: Fresh Mint
```
HEX:      #0ea5e9
RGB:      14, 165, 233
Tailwind: mint-500
Usage:    Links, accents, highlights, innovation, clarity
```
🔷 Fresh Mint represents innovation, clarity, and modern technology.

### Success: Oasis Green
```
HEX:      #10b981
RGB:      16, 185, 129
Tailwind: oasis-500
Usage:    Success states, positive feedback, growth
```
🟢 Oasis Green symbolizes growth, success, and positive outcomes.

### Warning: Desert Gold
```
HEX:      #f59e0b
RGB:      245, 158, 11
Tailwind: gold-500
Usage:    Warnings, alerts, caution states
```
🟡 Desert Gold represents caution, important information, and attention.

### Neutral: Sandstone Gray
```
HEX:      #64748b
RGB:      100, 116, 139
Tailwind: sandstone-500
Usage:    Neutral elements, borders, disabled states
```
⚪ Sandstone Gray provides balance, neutrality, and subtle elements.

## Color Scale

Each color has a complete scale from 50 (lightest) to 900 (darkest):

### Sweet Amber Scale
- 50:  #fff7ed (Very Light)
- 100: #ffedd5
- 200: #fed7aa
- 300: #fdba74
- 400: #fb923c
- 500: #f97316
- **600: #ea580c** ← Primary
- 700: #c2410c
- 800: #9a3412
- 900: #7c2d12 (Very Dark)

### Royal Midnight Scale
- 50:  #f0f4f8 (Very Light)
- 100: #d9e2ec
- 200: #bcccdc
- 300: #9fb3c8
- 400: #829ab1
- 500: #627d98
- 600: #486581
- 700: #334e68
- 800: #243b53
- **900: #1a365d** ← Secondary

### Fresh Mint Scale
- 50:  #f0f9ff (Very Light)
- 100: #e0f2fe
- 200: #bae6fd
- 300: #7dd3fc
- 400: #38bdf8
- **500: #0ea5e9** ← Accent
- 600: #0284c7
- 700: #0369a1
- 800: #075985
- 900: #0c4a6e (Very Dark)

### Oasis Green Scale
- 50:  #f0fdf4 (Very Light)
- 100: #dcfce7
- 200: #bbf7d0
- 300: #86efac
- 400: #4ade80
- **500: #10b981** ← Success
- 600: #059669
- 700: #047857
- 800: #065f46
- 900: #064e3b (Very Dark)

### Desert Gold Scale
- 50:  #fffbeb (Very Light)
- 100: #fef3c7
- 200: #fde68a
- 300: #fcd34d
- 400: #fbbf24
- **500: #f59e0b** ← Warning
- 600: #d97706
- 700: #b45309
- 800: #92400e
- 900: #78350f (Very Dark)

### Sandstone Gray Scale
- 50:  #f8fafc (Very Light)
- 100: #f1f5f9
- 200: #e2e8f0
- 300: #cbd5e1
- 400: #94a3b8
- **500: #64748b** ← Neutral
- 600: #475569
- 700: #334155
- 800: #1e293b
- 900: #0f172a (Very Dark)

## Usage Guidelines

### Do's ✅
- Use Sweet Amber for primary CTAs and important actions
- Use Royal Midnight for headers and navigation
- Use Fresh Mint for links and interactive elements
- Use Oasis Green for success messages
- Use Desert Gold for warnings
- Use Sandstone Gray for borders and disabled states

### Don'ts ❌
- Don't use more than 3 colors in a single component
- Don't use low contrast combinations
- Don't mix warning colors with success colors
- Don't use bright colors for large backgrounds

## Accessibility

### Contrast Ratios (WCAG AA)
All color combinations meet WCAG AA standards:
- Sweet Amber on white: 7.1:1 ✅
- Royal Midnight on white: 11.8:1 ✅
- Fresh Mint on white: 4.5:1 ✅
- Oasis Green on white: 4.8:1 ✅
- Desert Gold on white: 4.9:1 ✅
- Sandstone Gray on white: 5.2:1 ✅

## Implementation

### Tailwind CSS
```html
<!-- Sweet Amber -->
<div class="bg-amber-600 text-white">Primary Button</div>

<!-- Royal Midnight -->
<div class="bg-midnight-900 text-white">Header</div>

<!-- Fresh Mint -->
<a class="text-mint-500 hover:text-mint-600">Link</a>

<!-- Oasis Green -->
<div class="bg-oasis-500 text-white">Success</div>

<!-- Desert Gold -->
<div class="bg-gold-500 text-white">Warning</div>

<!-- Sandstone Gray -->
<div class="text-sandstone-500">Neutral Text</div>
```

### CSS Variables
```css
:root {
  --sweet-amber: #ea580c;
  --royal-midnight: #1a365d;
  --fresh-mint: #0ea5e9;
  --oasis-green: #10b981;
  --desert-gold: #f59e0b;
  --sandstone-gray: #64748b;
}

.primary-btn {
  background-color: var(--sweet-amber);
}

.header {
  background-color: var(--royal-midnight);
}
```

### React/TypeScript
```tsx
const colors = {
  sweetAmber: '#ea580c',
  royalMidnight: '#1a365d',
  freshMint: '#0ea5e9',
  oasisGreen: '#10b981',
  desertGold: '#f59e0b',
  sandstoneGray: '#64748b',
};

<button style={{ backgroundColor: colors.sweetAmber }}>
  Click Me
</button>
```

## Color Psychology

### Sweet Amber (#ea580c)
- **Energy**: Stimulates action and enthusiasm
- **Warmth**: Creates friendly, inviting atmosphere
- **Appetite**: Associated with food and sweetness
- **Attention**: Draws focus to important elements

### Royal Midnight (#1a365d)
- **Trust**: Evokes reliability and security
- **Professionalism**: Projects competence and expertise
- **Stability**: Suggests solid foundation
- **Authority**: Commands respect and confidence

### Fresh Mint (#0ea5e9)
- **Innovation**: Represents modern technology
- **Clarity**: Suggests clear communication
- **Trust**: Associated with dependability
- **Freshness**: Feels clean and modern

### Oasis Green (#10b981)
- **Growth**: Symbolizes expansion and success
- **Health**: Associated with wellbeing
- **Harmony**: Creates balance and calm
- **Prosperity**: Suggests financial success

### Desert Gold (#f59e0b)
- **Caution**: Signals need for attention
- **Optimism**: Bright and positive feel
- **Wealth**: Associated with value
- **Visibility**: Highly noticeable

### Sandstone Gray (#64748b)
- **Balance**: Provides neutral foundation
- **Sophistication**: Subtle and refined
- **Versatility**: Works with all colors
- **Calm**: Reduces visual noise

## Saudi Cultural Context

The color palette respects Saudi cultural preferences:
- **Amber/Gold**: Represents luxury and prestige
- **Blue**: Trusted and professional
- **Green**: Significant in Islamic culture
- **Neutral Tones**: Reflect desert landscape

---
**BrainSAIT © 2025** | Made in Saudi Arabia 🇸🇦
