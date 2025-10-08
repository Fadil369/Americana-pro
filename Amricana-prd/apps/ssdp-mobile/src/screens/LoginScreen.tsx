// BRAINSAIT: Login screen with bilingual support for Sales Rep and Driver apps
// BILINGUAL: Supports Arabic and English with RTL layout
// SECURITY: Secure authentication with role-based routing

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'الرجاء إدخال اسم المستخدم وكلمة المرور' : 'Please enter username and password'
      );
      return;
    }

    try {
      await login(username, password);
      
      // Navigate based on role (demo: check username prefix)
      if (username.startsWith('driver')) {
        navigation.replace('DriverDashboard');
      } else {
        navigation.replace('SalesRepDashboard');
      }
    } catch (error) {
      Alert.alert(
        isRTL ? 'خطأ في تسجيل الدخول' : 'Login Failed',
        isRTL ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password'
      );
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1a365d', '#ea580c']}
        style={styles.gradient}
      >
        {/* Language Toggle */}
        <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
          <Ionicons name="language" size={24} color="#fff" />
          <Text style={styles.languageText}>
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </Text>
        </TouchableOpacity>

        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="cube" size={80} color="#fff" />
          </View>
          <Text style={styles.title}>
            {isRTL ? 'منصة التوزيع الذكية' : 'Smart Distribution Platform'}
          </Text>
          <Text style={styles.subtitle}>SSDP</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={24}
              color="#64748b"
              style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={t('login.username')}
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color="#64748b"
              style={[styles.inputIcon, isRTL && styles.inputIconRTL]}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={t('login.password')}
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textAlign={isRTL ? 'right' : 'left'}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>
                {t('login.loginButton')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>
              {t('login.forgotPassword')}
            </Text>
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>
              {isRTL ? 'حسابات تجريبية:' : 'Demo Accounts:'}
            </Text>
            <Text style={styles.demoText}>
              {isRTL ? 'مندوب مبيعات:' : 'Sales Rep:'} sales1 / password
            </Text>
            <Text style={styles.demoText}>
              {isRTL ? 'سائق:' : 'Driver:'} driver1 / password
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {isRTL ? 'مدعوم من برين سايت' : 'Powered by BrainSAIT'}
        </Text>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
  },
  languageText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  inputRTL: {
    textAlign: 'right',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#64748b',
    fontSize: 14,
  },
  demoCredentials: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    textAlign: 'center',
    color: '#fff',
    opacity: 0.8,
    marginTop: 24,
    fontSize: 12,
  },
});

export default LoginScreen;
