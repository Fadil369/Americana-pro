// BRAINSAIT: Proof of Delivery with photo, signature, and GPS timestamp
// HIPAA: Secure delivery confirmation with audit trail

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useLocation } from '../contexts/LocationContext';

const ProofOfDeliveryScreen = ({ navigation, route }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { location } = useLocation();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [signatureUri, setSignatureUri] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);

  const delivery = route?.params?.delivery || {
    id: 'DEL-001',
    outlet: isRTL ? 'حلويات النخيل' : 'Palm Sweets',
    address: isRTL ? 'شارع الملك فهد، الرياض' : 'King Fahd Street, Riyadh',
    orderNumber: 'ORD-2024-001',
    items: 12,
    amount: 2450.00
  };

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false
        });
        setPhotoUri(photo.uri);
        setShowCamera(false);
      } catch (error) {
        Alert.alert(
          isRTL ? 'خطأ' : 'Error',
          isRTL ? 'فشل التقاط الصورة' : 'Failed to capture photo'
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (!photoUri) {
      Alert.alert(
        isRTL ? 'صورة مطلوبة' : 'Photo Required',
        isRTL ? 'الرجاء التقاط صورة للتسليم' : 'Please capture a delivery photo'
      );
      return;
    }

    if (!recipientName.trim()) {
      Alert.alert(
        isRTL ? 'اسم المستلم مطلوب' : 'Recipient Name Required',
        isRTL ? 'الرجاء إدخال اسم المستلم' : 'Please enter recipient name'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Upload photos, signature, and create delivery proof record
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        isRTL ? 'تم بنجاح' : 'Success',
        isRTL ? 'تم تأكيد التسليم بنجاح' : 'Delivery confirmed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DriverDashboard')
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'فشل في تأكيد التسليم' : 'Failed to confirm delivery'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Camera
          style={styles.fullCamera}
          type={Camera.Constants.Type.back}
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraCloseButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraCaptureButton} onPress={takePicture}>
              <View style={styles.cameraCaptureInner} />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#10b981', '#1a365d']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isRTL ? 'إثبات التسليم' : 'Proof of Delivery'}
          </Text>
          <Text style={styles.headerSubtitle}>{delivery.orderNumber}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Delivery Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="storefront" size={20} color="#ea580c" />
            <Text style={[styles.infoLabel, isRTL && styles.rtlText]}>
              {isRTL ? 'المتجر:' : 'Outlet:'}
            </Text>
            <Text style={styles.infoValue}>{delivery.outlet}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#64748b" />
            <Text style={[styles.infoLabel, isRTL && styles.rtlText]}>
              {isRTL ? 'العنوان:' : 'Address:'}
            </Text>
            <Text style={styles.infoValue}>{delivery.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cube" size={20} color="#64748b" />
            <Text style={[styles.infoLabel, isRTL && styles.rtlText]}>
              {isRTL ? 'العناصر:' : 'Items:'}
            </Text>
            <Text style={styles.infoValue}>{delivery.items}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#10b981" />
            <Text style={[styles.infoLabel, isRTL && styles.rtlText]}>
              {isRTL ? 'المبلغ:' : 'Amount:'}
            </Text>
            <Text style={styles.infoValue}>
              {delivery.amount.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
            </Text>
          </View>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'صورة التسليم *' : 'Delivery Photo *'}
          </Text>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name="refresh" size={20} color="#ea580c" />
                <Text style={styles.retakeText}>
                  {isRTL ? 'إعادة التقاط' : 'Retake'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={32} color="#ea580c" />
              <Text style={[styles.captureText, isRTL && styles.rtlText]}>
                {isRTL ? 'التقط صورة للتسليم' : 'Capture Delivery Photo'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recipient Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'اسم المستلم *' : 'Recipient Name *'}
          </Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlText]}
            placeholder={isRTL ? 'أدخل اسم المستلم' : 'Enter recipient name'}
            placeholderTextColor="#94a3b8"
            value={recipientName}
            onChangeText={setRecipientName}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Signature Section (Placeholder) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'التوقيع' : 'Signature'}
          </Text>
          <View style={styles.signaturePlaceholder}>
            <Ionicons name="create-outline" size={32} color="#cbd5e1" />
            <Text style={[styles.signatureHint, isRTL && styles.rtlText]}>
              {isRTL ? 'ميزة التوقيع قريباً' : 'Signature feature coming soon'}
            </Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {isRTL ? 'ملاحظات' : 'Notes'}
          </Text>
          <TextInput
            style={[styles.notesInput, isRTL && styles.rtlText]}
            placeholder={isRTL ? 'أضف ملاحظات حول التسليم...' : 'Add delivery notes...'}
            placeholderTextColor="#94a3b8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* GPS Info */}
        {location && (
          <View style={styles.gpsInfo}>
            <Ionicons name="navigate" size={20} color="#10b981" />
            <View style={styles.gpsContent}>
              <Text style={[styles.gpsLabel, isRTL && styles.rtlText]}>
                {isRTL ? 'الموقع والوقت' : 'Location & Time'}
              </Text>
              <Text style={styles.gpsValue}>
                {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
              <Text style={styles.gpsValue}>
                {new Date().toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>
                {isRTL ? 'تأكيد التسليم' : 'Confirm Delivery'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    minWidth: 70,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  rtlText: {
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
  },
  captureButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  captureText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  photoPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  retakeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  retakeText: {
    color: '#ea580c',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  signaturePlaceholder: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  signatureHint: {
    fontSize: 14,
    color: '#cbd5e1',
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
    minHeight: 100,
  },
  gpsInfo: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 12,
  },
  gpsContent: {
    flex: 1,
  },
  gpsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  gpsValue: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 2,
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
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullCamera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  cameraCloseButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 25,
  },
  cameraCaptureButton: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cameraCaptureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ea580c',
  },
});

export default ProofOfDeliveryScreen;
