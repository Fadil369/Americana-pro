import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const OutletRegistrationScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [formData, setFormData] = useState({
    crNumber: '',
    nameAr: '',
    nameEn: '',
    contactPerson: '',
    phone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const validateCRNumber = (crNumber: string) => {
    return /^\d{10}$/.test(crNumber);
  };

  const verifyCommercialRegistration = async () => {
    if (!validateCRNumber(formData.crNumber)) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'رقم السجل التجاري يجب أن يكون 10 أرقام' : 'Commercial registration must be 10 digits'
      );
      return;
    }

    setIsVerifying(true);
    
    try {
      // Mock API call to verify CR number
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful verification
      const mockVerification = {
        success: true,
        businessName: 'متجر الحلويات الذهبية',
        address: 'شارع الملك فهد، الرياض',
        city: 'الرياض',
        region: 'منطقة الرياض'
      };

      if (mockVerification.success) {
        setFormData(prev => ({
          ...prev,
          nameAr: mockVerification.businessName
        }));
        
        Alert.alert(
          isRTL ? 'تم التحقق بنجاح' : 'Verification Successful',
          isRTL ? 
            `تم العثور على: ${mockVerification.businessName}\nالعنوان: ${mockVerification.address}` :
            `Found: ${mockVerification.businessName}\nAddress: ${mockVerification.address}`
        );
      }
    } catch (error) {
      Alert.alert(
        isRTL ? 'خطأ في التحقق' : 'Verification Error',
        isRTL ? 'لم يتم العثور على السجل التجاري' : 'Commercial registration not found'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.crNumber || !formData.nameAr || !formData.contactPerson || !formData.phone) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call to register outlet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        isRTL ? 'تم التسجيل بنجاح' : 'Registration Successful',
        isRTL ? 'تم تسجيل المنفذ بنجاح وسيتم مراجعته قريباً' : 'Outlet registered successfully and will be reviewed soon',
        [
          {
            text: isRTL ? 'موافق' : 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'حدث خطأ أثناء التسجيل' : 'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtl]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isRTL ? 'تسجيل منفذ جديد' : 'Register New Outlet'}
        </Text>
        <Text style={styles.subtitle}>
          {isRTL ? 'يرجى ملء البيانات التالية لتسجيل منفذ جديد' : 'Please fill the following details to register a new outlet'}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Commercial Registration Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isRTL ? 'رقم السجل التجاري *' : 'Commercial Registration Number *'}
          </Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[styles.input, styles.inputWithButtonText, isRTL && styles.rtlText]}
              value={formData.crNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, crNumber: text }))}
              placeholder={isRTL ? '1234567890' : '1234567890'}
              keyboardType="numeric"
              maxLength={10}
              textAlign={isRTL ? 'right' : 'left'}
            />
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={verifyCommercialRegistration}
              disabled={isVerifying || !formData.crNumber}
            >
              {isVerifying ? (
                <Ionicons name="refresh" size={16} color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
              )}
              <Text style={styles.verifyButtonText}>
                {isVerifying ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : (isRTL ? 'تحقق' : 'Verify')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Name Arabic */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isRTL ? 'اسم المنشأة (عربي) *' : 'Business Name (Arabic) *'}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlText]}
            value={formData.nameAr}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nameAr: text }))}
            placeholder={isRTL ? 'متجر الحلويات' : 'Sweet Store'}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Business Name English */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isRTL ? 'اسم المنشأة (إنجليزي)' : 'Business Name (English)'}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlText]}
            value={formData.nameEn}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nameEn: text }))}
            placeholder="Sweet Store"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Contact Person */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isRTL ? 'الشخص المسؤول *' : 'Contact Person *'}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlText]}
            value={formData.contactPerson}
            onChangeText={(text) => setFormData(prev => ({ ...prev, contactPerson: text }))}
            placeholder={isRTL ? 'أحمد محمد' : 'Ahmed Mohammed'}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isRTL ? 'رقم الهاتف *' : 'Phone Number *'}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlText]}
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="+966501234567"
            keyboardType="phone-pad"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isRTL ? 'البريد الإلكتروني' : 'Email'}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlText]}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="contact@sweetstore.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading && <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />}
          <Text style={styles.submitButtonText}>
            {isLoading ? 
              (isRTL ? 'جاري التسجيل...' : 'Registering...') : 
              (isRTL ? 'تسجيل المنفذ' : 'Register Outlet')
            }
          </Text>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  rtlText: {
    textAlign: 'right',
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWithButtonText: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIcon: {
    marginRight: 8,
  },
});

export default OutletRegistrationScreen;
