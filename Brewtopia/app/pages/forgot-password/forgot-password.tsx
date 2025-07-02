import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import ApiService from '../../utils/ApiService';
import DebugService from '../../utils/DebugService';
import AppLoading from '../../components/AppLoading';
import { LinearGradient } from 'expo-linear-gradient';

interface ForgotPasswordResponse {
  message: string;
  response: {
    message: string;
    resetLink: string;
  };
}

export default function ForgotPassword() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validate email format
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleForgotPassword = async () => {
    // Reset states
    setIsError(false);
    setIsSuccess(false);
    
    // Validate email
    if (!email) {
      setIsError(true);
      setErrorMessage('Vui lòng nhập địa chỉ email của bạn');
      return;
    }
    
    if (!validateEmail(email)) {
      setIsError(true);
      setErrorMessage('Địa chỉ email không hợp lệ');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the forgot password API using the ApiService
      await ApiService.auth.forgotPassword(email);
      
      // Success
      setIsSuccess(true);
      setSuccessMessage('Mã đặt lại mật khẩu đã được gửi qua Gmail của bạn. Vui lòng kiểm tra email!');
      
      // Navigate back to login after 3 seconds
      setTimeout(() => {
        router.replace('/pages/login/login');
      }, 3000);
      
    } catch (error: any) {
      // Error handling
      setIsError(true);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        setErrorMessage(error.message as string);
      } else {
        setErrorMessage('Không thể gửi mã đặt lại mật khẩu. Vui lòng thử lại sau.');
      }
      DebugService.logError('Forgot password error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F5F1EB', '#E8DDD4', '#D4BDAA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonContainer}>
            <AntDesign name="left" size={24} color="#6E543C" />
          </View>
        </TouchableOpacity>

        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Image 
                source={require('../../../assets/images/Logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.tagline}>QUÊN MẬT KHẨU</Text>
            </View>

            {/* Main Content */}
            <View style={styles.contentContainer}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <MaterialIcons name="lock-reset" size={60} color="#6E543C" />
              </View>

              {/* Title */}
              <Text style={styles.title}>Đặt Lại Mật Khẩu</Text>
              <Text style={styles.subtitle}>
                Đừng lo lắng! Nhập email liên kết với tài khoản của bạn và chúng tôi sẽ gửi mã đặt lại mật khẩu qua Gmail.
              </Text>

              {/* Email Input Card */}
              <View style={styles.inputCard}>
                <Text style={styles.label}>Địa Chỉ Email</Text>
                <View style={[styles.inputContainer, isError && styles.inputError]}>
                  <MaterialIcons name="email" size={20} color="#6E543C" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập địa chỉ email của bạn"
                    placeholderTextColor="#A0815F"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setIsError(false);
                      setIsSuccess(false);
                    }}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Messages */}
              {isError && (
                <View style={styles.messageCard}>
                  <MaterialIcons name="error" size={20} color="#E74C3C" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {isSuccess && (
                <View style={[styles.messageCard, styles.successCard]}>
                  <MaterialIcons name="check-circle" size={20} color="#27AE60" />
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              )}

              {/* Loading */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <AppLoading text="Đang gửi mã qua email..." />
                </View>
              )}

              {/* Send Button */}
              <TouchableOpacity 
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#A0815F', '#A0815F'] : ['#6E543C', '#8B6F47']}
                  style={styles.buttonGradient}
                >
                  <MaterialIcons name="send" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Gửi Mã</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Remember Password Link */}
              <View style={styles.rememberContainer}>
                <Text style={styles.rememberText}>Nhớ mật khẩu? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>Đăng Nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  logo: {
    width: 280,
    height: 80,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#6E543C',
    fontWeight: '500',
    letterSpacing: 2,
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: 500,
    elevation: 3,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(110, 84, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  inputCard: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(110, 84, 60, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputError: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 12,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  successCard: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderLeftColor: '#27AE60',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successText: {
    color: '#27AE60',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    marginVertical: 20,
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  rememberText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  loginLink: {
    fontSize: 14,
    color: '#6E543C',
    fontWeight: '600',
  },
}); 