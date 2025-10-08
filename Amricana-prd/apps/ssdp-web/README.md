# SSDP Web Application

## Overview
Smart Sweet Distribution Platform (SSDP) web application built with Next.js, featuring BrainSAIT design system, bilingual support (Arabic/English), and glass morphism UI.

## Tech Stack
- **Framework**: Next.js 15
- **UI**: React 18, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Maps**: Leaflet, React Leaflet
- **Charts**: Recharts
- **i18n**: react-i18next, i18next

## Getting Started

### Installation
```bash
npm install --legacy-peer-deps
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build
```bash
npm run build
npm start
```

## Design System

### Color Palette
The app uses BrainSAIT's SSDP color palette:

- **Sweet Amber** (#ea580c) - Primary color for CTAs and highlights
- **Royal Midnight** (#1a365d) - Secondary color for headers and navigation
- **Fresh Mint** (#0ea5e9) - Accent color for links and highlights
- **Oasis Green** (#10b981) - Success states
- **Desert Gold** (#f59e0b) - Warnings and alerts
- **Sandstone Gray** (#64748b) - Neutral elements

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete documentation.

### UI Components

#### GlassCard
Glass morphism card component with backdrop blur and hover effects:
```tsx
import { GlassCard } from '@/components/ui';

<GlassCard hover gradient className="p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</GlassCard>
```

#### BilingualText
Auto-switching text component based on locale:
```tsx
import { BilingualText } from '@/components/ui';

<BilingualText 
  as="h1"
  ar="مرحباً بك"
  en="Welcome"
  className="text-3xl"
/>
```

#### MeshGradient
Animated mesh gradient background with 60% wireframe overlay:
```tsx
import { MeshGradient } from '@/components/ui';

<MeshGradient animated>
  <div>Content on mesh background</div>
</MeshGradient>
```

## Internationalization (i18n)

### Supported Languages
- **Arabic (ar)** - Default language
- **English (en)** - Secondary language

### Usage
```tsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

<p>{t('common.dashboard')}</p>
```

### Adding Translations
1. Edit `locales/ar.json` for Arabic
2. Edit `locales/en.json` for English
3. Use keys like `section.key` for organization

### RTL Support
The app automatically:
- Sets `dir="rtl"` for Arabic
- Switches to Noto Sans Arabic font
- Adjusts layout spacing and alignment

## Project Structure
```
apps/ssdp-web/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Header.tsx      # App header
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── ...
├── pages/              # Next.js pages
│   ├── _app.tsx        # App wrapper with i18n
│   ├── index.tsx       # Dashboard
│   └── design-demo.tsx # Design system demo
├── styles/             # CSS files
│   └── globals.css     # Global styles
├── locales/            # i18n translations
│   ├── ar.json         # Arabic translations
│   └── en.json         # English translations
├── i18n.ts            # i18n configuration
├── tailwind.config.js # Tailwind configuration
└── next.config.js     # Next.js configuration
```

## Key Features

### Glass Morphism
All cards and elevated surfaces use glass morphism:
- 10% transparent white background
- 20px backdrop blur
- Semi-transparent borders
- Smooth hover transitions

### Mesh Gradients
Hero sections and backgrounds feature:
- Multi-point radial gradients
- 60% opacity wireframe overlay (20px grid)
- Optional animation (15s loop)
- Fixed background attachment

### Bilingual First
- Arabic default, seamless English switching
- Automatic RTL/LTR layout
- Font family changes per language
- Cultural context considered

### Animations
Powered by Framer Motion:
- Smooth page transitions
- Hover and tap interactions
- Staggered list animations
- Reduced motion support

## Design Demo
View all design system components at `/design-demo`:
- Color palette showcase
- Glass morphism examples
- Mesh gradient variations
- Button styles
- Interactive demos

## Performance

### Optimizations
- Image optimization via Next.js
- Code splitting by route
- CSS purging in production
- Lazy loading for heavy components

### Best Practices
- Use `GlassCard` for elevated content
- Apply mesh gradients sparingly (performance)
- Prefer CSS animations over JS
- Optimize images before upload

## Accessibility

### Features
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast color ratios
- Reduced motion support

### Testing
- Use keyboard to navigate
- Test with screen readers
- Verify color contrast
- Check focus indicators

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Backdrop blur requires recent browser versions.

## Contributing

### Code Style
- Use TypeScript for new files
- Follow existing component patterns
- Add comments for complex logic
- Use NEURAL/BILINGUAL/BRAINSAIT tags

### Component Checklist
Before committing UI components:
- [ ] Follows BrainSAIT color palette
- [ ] Includes glass morphism styling
- [ ] Supports RTL/LTR layouts
- [ ] Has bilingual text support
- [ ] Animations run smoothly
- [ ] Keyboard accessible
- [ ] Mobile responsive
- [ ] Dark mode compatible

## Deployment

### Cloudflare Pages
```bash
npm run build:cf
npm run deploy:cf
```

### Standard Deployment
```bash
npm run build
```

Output will be in `.next/` directory.

## Troubleshooting

### Installation Issues
Use `--legacy-peer-deps` flag if peer dependency conflicts occur.

### Build Errors
Ensure all TypeScript types are correct and imports resolve properly.

### i18n Not Working
Check that `i18n.ts` is imported in `_app.tsx` and locale files exist.

### Backdrop Blur Not Showing
Enable hardware acceleration or use a modern browser.

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [react-i18next](https://react.i18next.com)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## License
MIT License - See LICENSE file for details

## Support
For issues or questions, contact BrainSAIT support team.

---
Made with ❤️ in Saudi Arabia 🇸🇦 | BrainSAIT © 2025
