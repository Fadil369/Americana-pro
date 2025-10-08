// BRAINSAIT: Main application entry point for SSDP Mobile Apps
// BILINGUAL: Supports Arabic and English with full navigation
// NEURAL: Sales Rep and Driver experience with offline-first capability

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';

// Authentication
import LoginScreen from './src/screens/LoginScreen';

// Sales Rep Screens
import SalesRepDashboard from './src/screens/SalesRepDashboard';
import CheckInScreen from './src/screens/CheckInScreen';
import OrderScreen from './src/screens/OrderScreen';
import ProductCatalogScreen from './src/screens/ProductCatalogScreen';
import OutletMapScreen from './src/screens/OutletMapScreen';
import OutletRegistrationScreen from './src/screens/OutletRegistrationScreen';

// Driver Screens
import DriverDashboard from './src/screens/DriverDashboard';
import ProofOfDeliveryScreen from './src/screens/ProofOfDeliveryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <LocationProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#f8fafc' }
              }}
            >
              {/* Authentication */}
              <Stack.Screen name="Login" component={LoginScreen} />

              {/* Sales Rep Screens */}
              <Stack.Screen name="SalesRepDashboard" component={SalesRepDashboard} />
              <Stack.Screen name="CheckIn" component={CheckInScreen} />
              <Stack.Screen name="Order" component={OrderScreen} />
              <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
              <Stack.Screen name="OutletMap" component={OutletMapScreen} />
              <Stack.Screen name="OutletRegistration" component={OutletRegistrationScreen} />

              {/* Driver Screens */}
              <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
              <Stack.Screen name="ProofOfDelivery" component={ProofOfDeliveryScreen} />

              {/* Placeholder screens for future implementation */}
              <Stack.Screen
                name="RouteOptimization"
                component={DriverDashboard}
                options={{ title: 'Route Optimization' }}
              />
              <Stack.Screen
                name="DeliveryManifest"
                component={DriverDashboard}
                options={{ title: 'Delivery Manifest' }}
              />
              <Stack.Screen
                name="IncidentReport"
                component={DriverDashboard}
                options={{ title: 'Incident Report' }}
              />
              <Stack.Screen
                name="VehicleManagement"
                component={DriverDashboard}
                options={{ title: 'Vehicle Management' }}
              />
              <Stack.Screen
                name="DriverEarnings"
                component={DriverDashboard}
                options={{ title: 'Driver Earnings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </LocationProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
