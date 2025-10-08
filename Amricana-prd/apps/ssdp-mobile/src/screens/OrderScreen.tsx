// BRAINSAIT: Voice-enabled order creation screen
// BILINGUAL: Arabic/English voice recognition support
// MEDICAL: Order management with offline-first capability

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface OrderItem {
  sku: string;
  name: string;
  name_ar: string;
  quantity: number;
  price: number;
}

const OrderScreen = ({ navigation, route }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const outlet = route?.params?.outlet || {
    id: 'OUT_1234567890',
    name_ar: 'حلويات النخيل',
    name_en: 'Palm Sweets'
  };

  const mockProducts = [
    { sku: 'AMR-KUN-001', name_en: 'Fresh Cheese Kunafa', name_ar: 'كنافة بالجبن الطازجة', price: 45.00 },
    { sku: 'AMR-BAK-001', name_en: 'Pistachio Baklava', name_ar: 'بقلاوة بالفستق', price: 55.00 },
    { sku: 'AMR-MAM-001', name_en: 'Date Maamoul', name_ar: 'معمول بالتمر', price: 35.00 },
    { sku: 'AMR-QAT-001', name_en: 'Qatayef with Nuts', name_ar: 'قطايف بالمكسرات', price: 40.00 }
  ];

  const addItem = (product: typeof mockProducts[0]) => {
    const existingItem = orderItems.find(item => item.sku === product.sku);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.sku === product.sku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([
        ...orderItems,
        {
          sku: product.sku,
          name: product.name_en,
          name_ar: product.name_ar,
          quantity: 1,
          price: product.price
        }
      ]);
    }
  };

  const updateQuantity = (sku: string, delta: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.sku === sku) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (sku: string) => {
    setOrderItems(orderItems.filter(item => item.sku !== sku));
  };

  const handleVoiceOrder = async () => {
    // TODO: Implement voice recognition
    setIsListening(true);
    Alert.alert(
      isRTL ? 'الطلب الصوتي' : 'Voice Order',
      isRTL
        ? 'ميزة التعرف على الصوت قيد التطوير. سيتم دعم العربية والإنجليزية.'
        : 'Voice recognition feature is under development. Arabic and English will be supported.'
    );
    setTimeout(() => setIsListening(false), 2000);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateVAT = () => {
    return calculateTotal() * 0.15;
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'الرجاء إضافة منتجات إلى الطلب' : 'Please add products to the order'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        isRTL ? 'تم بنجاح' : 'Success',
        isRTL ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'فشل في إنشاء الطلب' : 'Failed to create order'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#ea580c', '#1a365d']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isRTL ? 'طلب جديد' : 'New Order'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isRTL ? outlet.name_ar : outlet.name_en}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={handleVoiceOrder}
          disabled={isListening}
        >
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={24}
            color={isListening ? '#ef4444' : '#fff'}
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'اختر المنتجات' : 'Select Products'}
          </Text>
          {mockProducts.map(product => (
            <TouchableOpacity
              key={product.sku}
              style={styles.productCard}
              onPress={() => addItem(product)}
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {isRTL ? product.name_ar : product.name_en}
                </Text>
                <Text style={styles.productPrice}>
                  {product.price.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                </Text>
              </View>
              <Ionicons name="add-circle" size={32} color="#ea580c" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {isRTL ? 'عناصر الطلب' : 'Order Items'}
            </Text>
            {orderItems.map(item => (
              <View key={item.sku} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>
                    {isRTL ? item.name_ar : item.name}
                  </Text>
                  <Text style={styles.orderItemPrice}>
                    {(item.price * item.quantity).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                  </Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.sku, -1)}
                  >
                    <Ionicons name="remove" size={20} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.sku, 1)}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeItem(item.sku)}
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'ملاحظات' : 'Notes'}
          </Text>
          <TextInput
            style={[styles.notesInput, isRTL && styles.rtlText]}
            placeholder={isRTL ? 'أضف ملاحظات للطلب...' : 'Add order notes...'}
            placeholderTextColor="#94a3b8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Summary */}
        {orderItems.length > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {isRTL ? 'المجموع الفرعي:' : 'Subtotal:'}
              </Text>
              <Text style={styles.summaryValue}>
                {calculateTotal().toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {isRTL ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}
              </Text>
              <Text style={styles.summaryValue}>
                {calculateVAT().toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>
                {isRTL ? 'الإجمالي:' : 'Total:'}
              </Text>
              <Text style={styles.totalValue}>
                {(calculateTotal() + calculateVAT()).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      {orderItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRTL ? 'إرسال الطلب' : 'Submit Order'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
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
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#ea580c',
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 8,
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summary: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderScreen;
