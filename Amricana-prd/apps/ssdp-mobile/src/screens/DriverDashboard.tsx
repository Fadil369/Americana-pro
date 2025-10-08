// BRAINSAIT: Driver dashboard with route optimization and delivery tracking
// BILINGUAL: Full Arabic/English support with RTL layout

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const DriverDashboard = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const isRTL = i18n.language === 'ar';
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const todayStats = [
    {
      key: 'totalDeliveries',
      value: '12',
      label: isRTL ? 'إجمالي التسليمات' : 'Total Deliveries',
      icon: 'cube',
      color: '#10b981'
    },
    {
      key: 'completed',
      value: '8',
      label: isRTL ? 'مكتمل' : 'Completed',
      icon: 'checkmark-circle',
      color: '#3b82f6'
    },
    {
      key: 'pending',
      value: '4',
      label: isRTL ? 'معلق' : 'Pending',
      icon: 'time',
      color: '#f59e0b'
    },
    {
      key: 'earnings',
      value: '450',
      unit: isRTL ? 'ر.س' : 'SAR',
      label: isRTL ? 'الأرباح اليوم' : "Today's Earnings",
      icon: 'cash',
      color: '#ea580c'
    }
  ];

  const quickActions = [
    {
      key: 'route',
      title: isRTL ? 'عرض المسار' : 'View Route',
      icon: 'map',
      color: '#3b82f6',
      onPress: () => navigation.navigate('RouteOptimization')
    },
    {
      key: 'manifest',
      title: isRTL ? 'قائمة التسليم' : 'Delivery Manifest',
      icon: 'list',
      color: '#10b981',
      onPress: () => navigation.navigate('DeliveryManifest')
    },
    {
      key: 'pod',
      title: isRTL ? 'إثبات التسليم' : 'Proof of Delivery',
      icon: 'camera',
      color: '#f59e0b',
      onPress: () => navigation.navigate('ProofOfDelivery')
    },
    {
      key: 'incident',
      title: isRTL ? 'الإبلاغ عن حادث' : 'Report Incident',
      icon: 'warning',
      color: '#ef4444',
      onPress: () => navigation.navigate('IncidentReport')
    },
    {
      key: 'vehicle',
      title: isRTL ? 'إدارة المركبة' : 'Vehicle Management',
      icon: 'car',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('VehicleManagement')
    },
    {
      key: 'earnings',
      title: isRTL ? 'الأرباح' : 'Earnings',
      icon: 'wallet',
      color: '#ea580c',
      onPress: () => navigation.navigate('DriverEarnings')
    }
  ];

  const upcomingDeliveries = [
    {
      id: 'DEL-001',
      outlet: isRTL ? 'حلويات النخيل' : 'Palm Sweets',
      address: isRTL ? 'شارع الملك فهد، الرياض' : 'King Fahd Street, Riyadh',
      time: '10:00 AM',
      distance: '2.5',
      status: 'pending'
    },
    {
      id: 'DEL-002',
      outlet: isRTL ? 'حلويات الأمير' : 'Prince Sweets',
      address: isRTL ? 'طريق الملك عبدالعزيز' : 'King Abdulaziz Road',
      time: '11:30 AM',
      distance: '5.8',
      status: 'pending'
    },
    {
      id: 'DEL-003',
      outlet: isRTL ? 'متجر السعادة' : 'Happiness Store',
      address: isRTL ? 'حي العليا' : 'Olaya District',
      time: '02:00 PM',
      distance: '3.2',
      status: 'pending'
    }
  ];

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a365d', '#ea580c']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>
            {isRTL ? 'مرحباً' : 'Welcome'} {isRTL ? user?.name_ar : user?.name}
          </Text>
          <Text style={styles.roleText}>
            {isRTL ? 'سائق توصيل' : 'Delivery Driver'}
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          {todayStats.map(stat => (
            <View key={stat.key} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>
                {stat.value} {stat.unit || ''}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.key}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={[styles.actionTitle, isRTL && styles.rtlText]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {isRTL ? 'التسليمات القادمة' : 'Upcoming Deliveries'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeliveryManifest')}>
              <Text style={styles.viewAllText}>
                {isRTL ? 'عرض الكل' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>
          {upcomingDeliveries.map(delivery => (
            <TouchableOpacity
              key={delivery.id}
              style={styles.deliveryCard}
              onPress={() => navigation.navigate('ProofOfDelivery', { delivery })}
            >
              <View style={styles.deliveryIcon}>
                <Ionicons name="location" size={24} color="#ea580c" />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryOutlet}>{delivery.outlet}</Text>
                <Text style={styles.deliveryAddress}>{delivery.address}</Text>
                <View style={styles.deliveryMeta}>
                  <View style={styles.deliveryMetaItem}>
                    <Ionicons name="time-outline" size={16} color="#64748b" />
                    <Text style={styles.deliveryMetaText}>{delivery.time}</Text>
                  </View>
                  <View style={styles.deliveryMetaItem}>
                    <Ionicons name="navigate-outline" size={16} color="#64748b" />
                    <Text style={styles.deliveryMetaText}>
                      {delivery.distance} {isRTL ? 'كم' : 'km'}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Alert */}
        <View style={styles.safetyAlert}>
          <Ionicons name="shield-checkmark" size={24} color="#10b981" />
          <View style={styles.safetyAlertContent}>
            <Text style={[styles.safetyAlertTitle, isRTL && styles.rtlText]}>
              {isRTL ? 'تذكير السلامة' : 'Safety Reminder'}
            </Text>
            <Text style={[styles.safetyAlertText, isRTL && styles.rtlText]}>
              {isRTL
                ? 'تأكد من فحص المركبة قبل بدء المسار. القيادة الآمنة أولوية.'
                : 'Check your vehicle before starting the route. Safe driving is priority.'}
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  rtlText: {
    textAlign: 'right',
  },
  viewAllText: {
    fontSize: 14,
    color: '#ea580c',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    color: '#1e293b',
    textAlign: 'center',
    fontWeight: '600',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
  },
  deliveryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryOutlet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  deliveryMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  deliveryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryMetaText: {
    fontSize: 12,
    color: '#64748b',
  },
  safetyAlert: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  safetyAlertContent: {
    flex: 1,
    marginLeft: 12,
  },
  safetyAlertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  safetyAlertText: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 18,
  },
});

export default DriverDashboard;
