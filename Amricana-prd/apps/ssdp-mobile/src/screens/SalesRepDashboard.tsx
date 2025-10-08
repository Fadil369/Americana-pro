import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SalesRepDashboard = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stats = [
    { key: 'target', value: '50,000', unit: 'SAR', icon: 'target' },
    { key: 'achieved', value: '32,500', unit: 'SAR', icon: 'checkmark-circle' },
    { key: 'pendingOrders', value: '12', unit: '', icon: 'time' },
    { key: 'completedDeliveries', value: '8', unit: '', icon: 'checkmark-done' }
  ];

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtl]}>
      <LinearGradient
        colors={['#ea580c', '#1a365d']}
        style={styles.header}
      >
        <Text style={styles.welcomeText}>
          {t('dashboard.welcome')} أحمد
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
        </Text>
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

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Order')}
        >
          <Ionicons name="add-circle" size={32} color="#fff" />
          <Text style={styles.actionText}>{t('orders.newOrder')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="people" size={32} color="#fff" />
          <Text style={styles.actionText}>{t('navigation.customers')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  rtl: {
    direction: 'rtl',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
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
