# SSDP Mobile Apps - Implementation Guide

## Overview

This document provides a comprehensive guide to the implemented mobile applications for Sales Representatives and Drivers in the Smart Sweet Distribution Platform (SSDP).

## Architecture Summary

### Technology Stack
- **Framework**: React Native with Expo SDK 50
- **Navigation**: React Navigation v6 (Stack Navigator)
- **State Management**: Zustand + React Context API
- **Offline Storage**: AsyncStorage
- **Internationalization**: i18next with Arabic/English
- **Camera/Location**: Expo Camera, Expo Location
- **Styling**: React Native StyleSheet with Expo Linear Gradient

### Project Structure
```
apps/ssdp-mobile/
├── App.tsx                           # Main entry point with navigation
├── package.json                      # Dependencies and scripts
├── README.md                         # Project documentation
├── IMPLEMENTATION_GUIDE.md           # This file
└── src/
    ├── contexts/                     # React Context providers
    │   ├── AuthContext.tsx          # Authentication state
    │   └── LocationContext.tsx      # Location tracking
    ├── screens/                      # Application screens
    │   ├── LoginScreen.tsx          # Authentication
    │   ├── SalesRepDashboard.tsx    # Sales rep home
    │   ├── DriverDashboard.tsx      # Driver home
    │   ├── CheckInScreen.tsx        # Geofenced check-in
    │   ├── OrderScreen.tsx          # Order creation
    │   ├── ProofOfDeliveryScreen.tsx # POD capture
    │   ├── ProductCatalogScreen.tsx # Product browsing
    │   ├── OutletMapScreen.tsx      # Outlet locations
    │   └── OutletRegistrationScreen.tsx # New outlet setup
    ├── services/                     # Business logic
    │   └── offlineSync.ts           # Offline queue management
    ├── stores/                       # State management
    │   └── appStore.ts              # Global app state (Zustand)
    └── i18n/                         # Internationalization
        ├── index.ts                 # i18next setup
        └── locales/
            ├── ar.json              # Arabic translations
            └── en.json              # English translations
```

## Implemented Features

### 1. Authentication System
**File**: `src/contexts/AuthContext.tsx`, `src/screens/LoginScreen.tsx`

**Features**:
- Bilingual login screen (Arabic/English)
- Language toggle in UI
- Role-based authentication (Sales Rep / Driver)
- Automatic routing based on user role
- Mock authentication with demo credentials
- Logout functionality

**Demo Credentials**:
- Sales Rep: `sales1` / `password`
- Driver: `driver1` / `password`

**Key Functions**:
```typescript
const { login, logout, user, isAuthenticated } = useAuth();
await login(username, password);
logout();
```

### 2. Sales Rep Dashboard
**File**: `src/screens/SalesRepDashboard.tsx`

**Features**:
- Performance statistics (target, achieved, pending, completed)
- Quick action grid with 6 shortcuts:
  - Check In
  - New Order
  - Product Catalog
  - Map View
  - Register Outlet
  - Reports
- Bilingual interface with RTL support
- Logout button in header
- Localized date display

**Navigation**:
```typescript
navigation.navigate('CheckIn')
navigation.navigate('Order')
navigation.navigate('ProductCatalog')
navigation.navigate('OutletMap')
navigation.navigate('OutletRegistration')
```

### 3. Smart Check-In
**File**: `src/screens/CheckInScreen.tsx`

**Features**:
- Geofencing validation (100m radius)
- Camera integration for storefront photo
- GPS coordinate capture
- Distance calculation from outlet
- Photo preview with retake option
- Outlet information display
- Warning for out-of-range check-ins

**Key Components**:
- Camera integration with Expo Camera
- Location tracking with Expo Location
- Distance calculation using Haversine formula
- Geofence status indicator

**Permissions Required**:
- Camera
- Location (foreground)

### 4. Order Creation
**File**: `src/screens/OrderScreen.tsx`

**Features**:
- Voice order button (placeholder for future voice recognition)
- Product selection from catalog
- Quantity management (+/- buttons)
- Item removal capability
- Order notes field
- VAT calculation (15%)
- Subtotal and total display
- Bilingual product names

**Business Logic**:
```typescript
// VAT calculation
const vat = total * 0.15;
const grandTotal = total + vat;

// Order structure
{
  outlet_id: string,
  items: OrderItem[],
  notes: string,
  total_amount: number,
  vat_amount: number
}
```

### 5. Driver Dashboard
**File**: `src/screens/DriverDashboard.tsx`

**Features**:
- Daily statistics:
  - Total deliveries (12)
  - Completed (8)
  - Pending (4)
  - Today's earnings (450 SAR)
- Quick actions grid (6 items):
  - View Route
  - Delivery Manifest
  - Proof of Delivery
  - Report Incident
  - Vehicle Management
  - Earnings
- Upcoming deliveries list with:
  - Outlet name
  - Address
  - Time slot
  - Distance
- Safety alert reminder
- Pull-to-refresh functionality

### 6. Proof of Delivery
**File**: `src/screens/ProofOfDeliveryScreen.tsx`

**Features**:
- Delivery information display
- Photo capture for delivery proof
- Recipient name input (required)
- Order notes field
- GPS coordinates and timestamp
- Signature placeholder (coming soon)
- Photo retake capability

**Data Captured**:
- Delivery photo with timestamp
- GPS coordinates
- Recipient name
- Delivery notes
- Timestamp (ISO 8601)

### 7. Location Services
**File**: `src/contexts/LocationContext.tsx`

**Features**:
- Location permission management
- Real-time location tracking
- Location accuracy configuration
- Error handling
- Permission request flow

**Usage**:
```typescript
const { location, requestPermission, startTracking } = useLocation();

// Request permission
const granted = await requestPermission();

// Start tracking
await startTracking();

// Access coordinates
const lat = location?.coords.latitude;
const lng = location?.coords.longitude;
```

### 8. Offline Sync Service
**File**: `src/services/offlineSync.ts`

**Features**:
- Queue-based sync mechanism
- Support for multiple data types:
  - Orders
  - Check-ins
  - Deliveries
  - Incidents
- Automatic retry logic (max 3 attempts)
- Persistent storage with AsyncStorage
- Background sync capability

**Usage**:
```typescript
import { offlineSyncService } from './services/offlineSync';

// Initialize service
await offlineSyncService.initialize();

// Add item to queue
const itemId = await offlineSyncService.addToQueue('order', orderData);

// Manual sync
const synced = await offlineSyncService.trySync();

// Check queue
const pending = offlineSyncService.getQueueLength();
```

**Queue Item Structure**:
```typescript
{
  id: string,
  type: 'order' | 'checkin' | 'delivery' | 'incident',
  data: any,
  timestamp: number,
  retryCount: number
}
```

### 9. State Management
**File**: `src/stores/appStore.ts`

**Features**:
- Global app state with Zustand
- Network status tracking
- Cached data storage (outlets, orders)
- Language preference
- Sync status monitoring

**Usage**:
```typescript
import { useAppStore } from './stores/appStore';

const { 
  isOnline, 
  setIsOnline,
  outlets,
  setOutlets,
  language,
  setLanguage,
  syncPending,
  setSyncPending
} = useAppStore();
```

### 10. Internationalization
**Files**: `src/i18n/index.ts`, `src/i18n/locales/*.json`

**Features**:
- Arabic and English support
- RTL layout for Arabic
- Cultural date formatting
- Number localization
- Dynamic language switching

**Translation Keys**:
```json
{
  "login": { "title", "username", "password", ... },
  "dashboard": { "welcome", "target", "achieved", ... },
  "orders": { "newOrder", "status", ... },
  "salesRep": { "checkIn", "voiceOrder", ... },
  "driver": { "route", "manifest", "proofOfDelivery", ... }
}
```

**Usage**:
```typescript
const { t, i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

// Translate
<Text>{t('dashboard.welcome')}</Text>

// Change language
i18n.changeLanguage('ar');
```

## Navigation Structure

### Authentication Flow
```
Login Screen
├─> Sales Rep Dashboard (if role = sales_rep)
└─> Driver Dashboard (if role = driver)
```

### Sales Rep Navigation
```
SalesRepDashboard
├─> CheckIn
├─> Order
├─> ProductCatalog
├─> OutletMap
└─> OutletRegistration
```

### Driver Navigation
```
DriverDashboard
├─> ProofOfDelivery
├─> RouteOptimization (placeholder)
├─> DeliveryManifest (placeholder)
├─> IncidentReport (placeholder)
├─> VehicleManagement (placeholder)
└─> DriverEarnings (placeholder)
```

## Styling Guidelines

### Color Palette
```javascript
Primary Colors:
- Orange: #ea580c (Primary actions, highlights)
- Navy: #1a365d (Headers, primary text)
- Teal: #10b981 (Success states)
- Blue: #3b82f6 (Info, secondary actions)

Background Colors:
- Background: #f8fafc
- Card Background: #ffffff
- Section Background: #f8fafc
- Input Background: #f1f5f9

Text Colors:
- Primary: #1e293b
- Secondary: #64748b
- Label: #94a3b8
- Light: #cbd5e1
```

### Component Patterns

#### Glass Card
```javascript
{
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}
```

#### Action Button
```javascript
{
  backgroundColor: '#ea580c',
  borderRadius: 12,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
}
```

#### Gradient Header
```javascript
<LinearGradient
  colors={['#ea580c', '#1a365d']}
  style={styles.header}
>
  {/* Header content */}
</LinearGradient>
```

## API Integration (To Be Implemented)

### Authentication Endpoint
```typescript
POST /api/auth/login
Body: { username: string, password: string }
Response: { token: string, user: User }
```

### Order Creation
```typescript
POST /api/orders
Headers: { Authorization: Bearer <token> }
Body: { 
  outlet_id: string,
  items: OrderItem[],
  total_amount: number,
  vat_amount: number,
  notes?: string
}
```

### Check-In
```typescript
POST /api/visits/check-in
Headers: { Authorization: Bearer <token> }
Body: {
  outlet_id: string,
  latitude: number,
  longitude: number,
  photo: File,
  timestamp: string
}
```

### Proof of Delivery
```typescript
POST /api/deliveries/proof
Headers: { Authorization: Bearer <token> }
Body: {
  delivery_id: string,
  photo: File,
  recipient_name: string,
  latitude: number,
  longitude: number,
  signature?: File,
  notes?: string,
  timestamp: string
}
```

## Testing Instructions

### Manual Testing

1. **Login Flow**:
   ```
   1. Open app → See login screen
   2. Toggle language (AR/EN)
   3. Login as sales1/password → Navigate to SalesRepDashboard
   4. Logout → Return to login
   5. Login as driver1/password → Navigate to DriverDashboard
   ```

2. **Sales Rep Flow**:
   ```
   1. From SalesRepDashboard, tap "Check In"
   2. Grant camera and location permissions
   3. Take photo of outlet
   4. Verify geofence status
   5. Submit check-in
   6. Return to dashboard
   7. Tap "New Order"
   8. Add products, adjust quantities
   9. Add notes, submit order
   ```

3. **Driver Flow**:
   ```
   1. From DriverDashboard, tap a delivery
   2. Navigate to Proof of Delivery
   3. Take delivery photo
   4. Enter recipient name
   5. Add notes
   6. Submit proof of delivery
   ```

### Offline Testing

1. Enable Airplane Mode
2. Create orders → Should queue
3. Check-in at outlets → Should queue
4. Disable Airplane Mode
5. Verify automatic sync

## Performance Considerations

### Image Optimization
- Camera quality set to 0.8 (80%)
- Photos stored locally before upload
- Consider image compression before sync

### Location Updates
- High accuracy only when needed
- Stop tracking when not in use
- Battery-efficient location updates

### Offline Storage
- AsyncStorage for queue persistence
- Limit queue size to prevent storage issues
- Regular cleanup of synced items

## Security Considerations

### Authentication
- JWT token storage (to be implemented)
- Token refresh mechanism
- Secure logout and token cleanup

### Data Privacy
- Encrypt sensitive data before storage
- Clear cache on logout
- Secure photo storage

### API Communication
- HTTPS only
- Token-based authentication
- Request/response validation

## Future Enhancements

### Phase 2 Features
1. **Voice Recognition**:
   - Integrate Arabic/English voice-to-text
   - Real-time order entry via voice
   - Accent and dialect support

2. **AR Catalog**:
   - AR.js or React Native AR integration
   - 3D product visualization
   - Virtual product placement

3. **Route Optimization**:
   - Integration with Google Maps/HERE
   - Traffic-aware routing
   - Multi-stop optimization

4. **Digital Signature**:
   - Canvas-based signature capture
   - SVG signature storage
   - Signature verification

5. **Real-time Tracking**:
   - WebSocket connection for live updates
   - Driver location sharing
   - ETA calculations

6. **Push Notifications**:
   - Order status updates
   - Delivery reminders
   - Performance alerts

7. **Gamification**:
   - Performance leaderboards
   - Achievement badges
   - Point system
   - Weekly/monthly challenges

## Troubleshooting

### Common Issues

**Camera not working**:
```
Solution: Check permissions in device settings
iOS: Settings → [App Name] → Camera
Android: Settings → Apps → [App Name] → Permissions
```

**Location inaccurate**:
```
Solution: 
1. Enable high accuracy mode
2. Check GPS signal (move to open area)
3. Restart location services
```

**Sync not working**:
```
Solution:
1. Check network connection
2. View sync queue: offlineSyncService.getQueueItems()
3. Manual trigger: offlineSyncService.trySync()
4. Check API endpoint configuration
```

**RTL layout issues**:
```
Solution: 
1. Ensure isRTL check: i18n.language === 'ar'
2. Apply rtl style: [styles.text, isRTL && styles.rtlText]
3. Use textAlign: isRTL ? 'right' : 'left'
```

## Development Workflow

### Running the App
```bash
# Install dependencies
npm install

# Start Expo
npm start

# Run on device
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

### Code Style
- Use BRAINSAIT, BILINGUAL, MEDICAL comment tags
- Follow existing naming conventions
- Maintain bilingual support in all components
- Ensure offline-first capability

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test

# Commit with descriptive message
git commit -m "Add feature description"

# Push and create PR
git push origin feature/your-feature
```

## Conclusion

The SSDP Mobile Apps provide a comprehensive, bilingual, offline-first solution for sales representatives and drivers. The modular architecture allows for easy extension and maintenance, while the offline sync ensures reliable operation in areas with poor connectivity.

For questions or issues, refer to the main project documentation or contact the development team.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintainer**: BrainSAIT Development Team
