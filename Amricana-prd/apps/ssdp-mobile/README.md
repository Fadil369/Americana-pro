# SSDP Mobile Apps - Sales Rep & Driver Experience

React Native/Expo mobile applications for field sales representatives and delivery drivers, featuring bilingual support (Arabic/English), offline-first architecture, and SSDP empowerment features.

## 🚀 Features

### Sales Rep App
- ✅ **Smart Check-In**: Geofenced outlet verification with photo capture
- ✅ **Voice-to-Order**: Arabic/English voice recognition placeholders for rapid order entry
- ✅ **Product Catalog**: Browse and order products with bilingual support
- ✅ **Outlet Management**: Map view and outlet registration
- ✅ **Dashboard**: Performance tracking with stats and quick actions
- 🔄 **Offline-First**: Queue orders and sync when connection available

### Driver App
- ✅ **Dashboard**: Daily stats, earnings, and delivery overview
- ✅ **Proof of Delivery**: Photo, signature, GPS timestamp capture
- ✅ **Route Navigation**: Quick access to route optimization (coming soon)
- ✅ **Delivery Manifest**: View and manage delivery schedule
- ✅ **Incident Reporting**: Quick damage/delay reporting interface
- ✅ **Vehicle Management**: Track vehicle status and maintenance
- ✅ **Earnings Tracker**: View daily and monthly earnings

## 🏗️ Architecture

```
apps/ssdp-mobile/
├── App.tsx                    # Main navigation and providers
├── src/
│   ├── screens/               # All app screens
│   │   ├── LoginScreen.tsx
│   │   ├── SalesRepDashboard.tsx
│   │   ├── DriverDashboard.tsx
│   │   ├── CheckInScreen.tsx
│   │   ├── OrderScreen.tsx
│   │   ├── ProofOfDeliveryScreen.tsx
│   │   ├── ProductCatalogScreen.tsx
│   │   ├── OutletMapScreen.tsx
│   │   └── OutletRegistrationScreen.tsx
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx
│   │   └── LocationContext.tsx
│   ├── services/              # Business logic services
│   │   └── offlineSync.ts
│   ├── stores/                # State management
│   │   └── appStore.ts
│   └── i18n/                  # Internationalization
│       ├── index.ts
│       └── locales/
│           ├── ar.json
│           └── en.json
└── package.json
```

## 🛠️ Technology Stack

- **Framework**: React Native with Expo SDK 50
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: Zustand for global state
- **Offline Storage**: AsyncStorage for local persistence
- **Internationalization**: i18next with Arabic/English support
- **UI Components**: 
  - Expo Vector Icons
  - Expo Linear Gradient
  - React Native Maps
  - Expo Camera & Location

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🌍 Bilingual Support

The app fully supports Arabic and English with:
- RTL (Right-to-Left) layout for Arabic
- Localized content in both languages
- Cultural date/time formatting
- Saudi-specific business logic

### Language Toggle
Users can switch languages from the login screen or app settings.

## 📱 Offline-First Architecture

### Sync Queue
All critical operations (orders, check-ins, deliveries) are:
1. Saved locally immediately
2. Added to sync queue
3. Automatically synced when connection is available
4. Retried up to 3 times on failure

### Usage
```typescript
import { offlineSyncService } from './src/services/offlineSync';

// Add item to sync queue
await offlineSyncService.addToQueue('order', orderData);

// Manually trigger sync
await offlineSyncService.trySync();

// Check queue status
const pendingCount = offlineSyncService.getQueueLength();
```

## 🔐 Authentication

Demo credentials:
- **Sales Rep**: `sales1` / `password`
- **Driver**: `driver1` / `password`

Role-based routing automatically navigates users to their appropriate dashboard.

## 📸 Key Screens

### LoginScreen
- Bilingual interface with language toggle
- Role-based authentication
- Demo credentials display

### SalesRepDashboard
- Performance stats (target, achieved, pending orders)
- Quick action buttons
- Today's date in localized format

### DriverDashboard
- Daily delivery stats
- Upcoming deliveries list
- Quick actions (route, manifest, POD, etc.)
- Safety reminders

### CheckInScreen
- Geofencing verification
- Camera integration for photo capture
- GPS coordinates display
- Smart validation

### ProofOfDeliveryScreen
- Photo capture for delivery proof
- Recipient name collection
- GPS timestamp
- Delivery notes

### OrderScreen
- Voice order button (placeholder)
- Product selection
- Quantity management
- VAT calculation
- Order notes

## 🚧 Coming Soon

- [ ] AR Product Catalog with real AR visualization
- [ ] Voice recognition integration for Arabic/English
- [ ] Route optimization with traffic data
- [ ] Digital signature capture
- [ ] Real-time driver tracking
- [ ] Push notifications
- [ ] Complete offline data sync
- [ ] Gamification features
- [ ] Performance leaderboards

## 🧪 Testing

Currently, the app uses mock data for demonstration. To connect to real APIs:

1. Update `AuthContext.tsx` login function
2. Configure API endpoints in a config file
3. Update sync service API calls
4. Add proper error handling

## 📝 Notes

- Camera permissions are required for check-in and proof of delivery
- Location permissions are required for geofencing
- The app is optimized for Saudi Arabia market
- All dates/times follow Saudi Arabia timezone (Asia/Riyadh)

## 🤝 Contributing

This is part of the BrainSAIT SSDP platform. Follow the project coding standards:
- Use BRAINSAIT, BILINGUAL, MEDICAL tags for code comments
- Maintain bilingual support in all features
- Ensure offline-first capability
- Follow existing naming conventions

## 📄 License

MIT - Part of the Americana-pro SSDP Platform
