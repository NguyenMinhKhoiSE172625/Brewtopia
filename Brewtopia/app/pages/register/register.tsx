import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

const PRIMARY_BROWN = '#7B4B27';
const SECONDARY_BROWN = '#8B6F47';

export default function Register() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setIsError(true);
      setErrorMessage('Please fill in all the information');
      return;
    }

    if (!termsAccepted) {
      setIsError(true);
      setErrorMessage('You must accept the terms and privacy policy');
      return;
    }

    try {
      // Prepare registration data
      const userData: { 
        email: string; 
        name: string; 
        password: string; 
        role?: string;
      } = {
        email: email,
        name: name,
        password: password,
      };
      
      // If role is provided (for business accounts), add it to the request
      if (role === 'admin') {
        userData.role = 'admin';
      }
      
      // Using ApiService for registration
      const data = await ApiService.auth.register(userData);
      
      // Store email and role for verification
      await AsyncStorage.setItem('registration_email', email);
      if (role === 'admin') {
        await AsyncStorage.setItem('registration_role', 'admin');
      }
      
      // Registration successful
      setIsError(false);
      router.push("/pages/verify-code/verify-code");
    } catch (error) {
      setIsError(true);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        setErrorMessage(error.message as string);
      } else {
        setErrorMessage('Registration failed');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.headerContainer}>
            <Image 
              source={require('../../../assets/images/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Form container */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Tạo tài khoản {role === 'admin' ? 'kinh doanh' : 'người dùng'}</Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên đăng nhập</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập của bạn"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email của bạn"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error message */}
            {isError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Terms and Conditions Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                {termsAccepted ? (
                  <Ionicons name="checkbox" size={24} color={PRIMARY_BROWN} />
                ) : (
                  <Ionicons name="square-outline" size={24} color="#666" />
                )}
              </TouchableOpacity>
              <Text style={styles.terms}>
                Tôi đồng ý với điều khoản và chính sách bảo mật
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[
                styles.registerButton, 
                !termsAccepted && styles.disabledButton
              ]}
              onPress={handleRegister}
              disabled={!termsAccepted}
            >
              <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>

            <Text style={styles.policyText}>
              Bằng việc tạo tài khoản hoặc đăng nhập, bạn đồng ý với{' '}
              <Text style={styles.linkText}>Điều khoản</Text> và{' '}
              <Text style={styles.linkText}>Điều kiện</Text> của chúng tôi
            </Text>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F6F2 100%)',
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: moderateScale(16),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  logo: {
    width: horizontalScale(300),
    height: verticalScale(80),
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: '700',
    color: PRIMARY_BROWN,
    marginBottom: verticalScale(30),
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    color: '#333',
    marginBottom: verticalScale(8),
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    fontSize: fontScale(16),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: moderateScale(12),
    paddingRight: moderateScale(15),
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  eyeButton: {
    padding: moderateScale(5),
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  errorText: {
    color: '#FF4444',
    fontSize: fontScale(14),
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  checkbox: {
    marginRight: horizontalScale(10),
  },
  terms: {
    color: '#666',
    fontSize: fontScale(14),
    flex: 1,
  },
  registerButton: {
    backgroundColor: PRIMARY_BROWN,
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(12),
    marginTop: verticalScale(20),
    shadowColor: PRIMARY_BROWN,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  policyText: {
    color: '#666',
    fontSize: fontScale(12),
    textAlign: 'center',
    marginTop: verticalScale(20),
    lineHeight: fontScale(16),
  },
  linkText: {
    textDecorationLine: 'underline',
    color: SECONDARY_BROWN,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(30),
  },
  loginText: {
    color: '#666',
    fontSize: fontScale(14),
  },
  loginLink: {
    color: PRIMARY_BROWN,
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontSize: fontScale(14),
  },
  disabledButton: {
    opacity: 0.6,
  },
});