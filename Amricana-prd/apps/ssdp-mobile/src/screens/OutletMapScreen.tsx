import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface Outlet {
  id: string;
  name_ar: string;
  name_en: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  city: string;
  status: string;
  credit_balance: number;
}

const OutletMapScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadOutlets();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isRTL ? 'إذن الموقع مطلوب' : 'Location Permission Required',
          isRTL ? 'يرجى السماح بالوصول للموقع لعرض المنافذ القريبة' : 'Please allow location access to show nearby outlets'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadOutlets = async () => {
    try {
      // Mock API call - replace with actual API
      const mockOutlets: Outlet[] = [
        {
          id: 'OUT_1234567890',
          name_ar: 'متجر الحلويات الذهبية',
          name_en: 'Golden Sweets Store',
          latitude: 24.7136,
          longitude: 46.6753,
          address: 'شارع الملك فهد، الرياض',
          district: 'المروج',
          city: 'الرياض',
          status: 'active',
          credit_balance: 2500.00
        },
        {
          id: 'OUT_0987654321',
          name_ar: 'حلويات الأمير',
          name_en: 'Prince Sweets',
          latitude: 24.6877,
          longitude: 46.7219,
          address: 'طريق الملك عبدالعزيز، الرياض',
          district: 'العليا',
          city: 'الرياض',
          status: 'active',
          credit_balance: 1800.00
        }
      ];
      
      setOutlets(mockOutlets);
    } catch (error) {
      console.error('Error loading outlets:', error);
    }
  };

  const handleMarkerPress = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
  };

  const navigateToOutlet = () => {
    if (selectedOutlet) {
      navigation.navigate('OutletDetail', { outlet: selectedOutlet });
    }
  };

  const createNewOrder = () => {
    if (selectedOutlet) {
      navigation.navigate('Order', { outlet: selectedOutlet });
    }
  };

  const getMarkerColor = (outlet: Outlet) => {
    if (outlet.status === 'active') {
      return outlet.credit_balance > 0 ? '#10b981' : '#f59e0b';
    }
    return '#ef4444';
  };

  const initialRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: 24.7136, // Riyadh default
    longitude: 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {outlets.map((outlet) => (
          <Marker
            key={outlet.id}
            coordinate={{
              latitude: outlet.latitude,
              longitude: outlet.longitude,
            }}
            onPress={() => handleMarkerPress(outlet)}
            pinColor={getMarkerColor(outlet)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(outlet) }]}>
              <Ionicons name="storefront" size={20} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Outlet Info Card */}
      {selectedOutlet && (
        <View style={[styles.infoCard, isRTL && styles.rtl]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.outletName}>
                {isRTL ? selectedOutlet.name_ar : selectedOutlet.name_en}
              </Text>
              <Text style={styles.outletAddress}>
                {selectedOutlet.address}
              </Text>
              <Text style={styles.creditBalance}>
                الرصيد: {selectedOutlet.credit_balance.toFixed(2)} ريال
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedOutlet(null)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={createNewOrder}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isRTL ? 'طلب جديد' : 'New Order'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={navigateToOutlet}
            >
              <Ionicons name="information-circle" size={20} color="#ea580c" />
              <Text style={[styles.actionButtonText, { color: '#ea580c' }]}>
                {isRTL ? 'التفاصيل' : 'Details'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('OutletRegistration')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rtl: {
    direction: 'rtl',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  outletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  outletAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  creditBalance: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#ea580c',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ea580c',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default OutletMapScreen;
