// BRAINSAIT: Sales Rep Dashboard with bilingual support and quick actions
// BILINGUAL: Full Arabic/English support with RTL layout
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const SalesRepDashboard = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const isRTL = i18n.language === 'ar';

  const stats = [
    { key: 'target', value: '50,000', unit: 'SAR', icon: 'target' },
    { key: 'achieved', value: '32,500', unit: 'SAR', icon: 'checkmark-circle' },
    { key: 'pendingOrders', value: '12', unit: '', icon: 'time' },
    { key: 'completedDeliveries', value: '8', unit: '', icon: 'checkmark-done' }
  ];

  const quickActions = [
    { 
      key: 'checkin', 
      title: isRTL ? 'تسجيل دخول' : 'Check In', 
      icon: 'location', 
      color: '#3b82f6',
      onPress: () => navigation.navigate('CheckIn')
    },
    { 
      key: 'order', 
      title: isRTL ? 'طلب جديد' : 'New Order', 
      icon: 'add-circle', 
      color: '#ea580c',
      onPress: () => navigation.navigate('Order')
    },
    { 
      key: 'catalog', 
      title: isRTL ? 'الكتالوج' : 'Catalog', 
      icon: 'grid', 
      color: '#10b981',
      onPress: () => navigation.navigate('ProductCatalog')
    },
    { 
      key: 'map', 
      title: isRTL ? 'الخريطة' : 'Map', 
      icon: 'map', 
      color: '#8b5cf6',
      onPress: () => navigation.navigate('OutletMap')
    },
    { 
      key: 'outlets', 
      title: isRTL ? 'تسجيل منفذ' : 'Register Outlet', 
      icon: 'storefront', 
      color: '#f59e0b',
      onPress: () => navigation.navigate('OutletRegistration')
    },
    { 
      key: 'reports', 
      title: isRTL ? 'التقارير' : 'Reports', 
      icon: 'stats-chart', 
      color: '#06b6d4',
      onPress: () => {}
    }
  ];

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtl]}>
      <LinearGradient
        colors={['#ea580c', '#1a365d']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>
            {t('dashboard.welcome')} {isRTL ? user?.name_ar : user?.name}
          </Text>
          <Text style={styles.roleText}>
            {isRTL ? 'مندوب مبيعات' : 'Sales Representative'}
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

      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <View key={stat.key} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={24} color="#ea580c" />
            <Text style={styles.statValue}>
              {stat.value} {stat.unit}
            </Text>
            <Text style={styles.statLabel}>
              {t(`dashboard.${stat.key}`)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  rtl: {
    direction: 'rtl',
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 5,
  },
  actionsSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
  },
  rtlText: {
    textAlign: 'right',
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
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#ea580c',
    borderRadius: 15,
    padding: 20,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SalesRepDashboard;
