import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import LoginScreen from './src/screens/LoginScreen';
import SalesRepDashboard from './src/screens/SalesRepDashboard';
import DriverDashboard from './src/screens/DriverDashboard';
import OrderScreen from './src/screens/OrderScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <LocationProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SalesRepDashboard" component={SalesRepDashboard} />
              <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
              <Stack.Screen name="Order" component={OrderScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </LocationProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
