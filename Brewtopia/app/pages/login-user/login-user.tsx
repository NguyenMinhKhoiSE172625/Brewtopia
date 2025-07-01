import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import DebugService from '../../utils/DebugService';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';
import NetworkHelper from '../../utils/NetworkHelper';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { API_URL, PRIMARY_BROWN } from '../../config/constants';

const GOOGLE_CLIENT_ID = '124662970356-igt3tcbfrcjfqi42k733kv9ue2ci4rq8.apps.googleusercontent.com';
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'; // Replace with your Facebook App ID

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const facebookConfig = {
  clientId: FACEBOOK_APP_ID,
  redirectUri: AuthSession.makeRedirectUri({}),
  scopes: ['public_profile', 'email'],
};

export default function LoginUser() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);

  const redirectUri = 'https://auth.expo.io/@khoiawesome/brewtopia';

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ['profile', 'email'],
      responseType: 'code',
    },
    discovery
  );

  const [facebookRequest, facebookResponse, facebookPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: FACEBOOK_APP_ID,
      redirectUri: AuthSession.makeRedirectUri({}),
      scopes: ['public_profile', 'email'],
    },
    {
      authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
    }
  );

  // Check network connectivity when component mounts
  useEffect(() => {
    const checkNetwork = async () => {
      const connected = await NetworkHelper.isConnected();
      setIsNetworkAvailable(connected);
      
      if (!connected) {
        setIsError(true);
        setErrorMessage('No internet connection. Please check your network settings.');
      }
    };
    
    checkNetwork();
  }, []);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success' && response.params.code) {
        setIsLoading(true);
        try {
          // Gửi code lên backend để xác thực
          const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: response.params.code }),
          });
          const data = await res.json();
          if (data.token) {
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
            router.push('/pages/home/home');
          } else {
            throw new Error(data.message || 'Google login failed.');
          }
        } catch (error) {
          setIsError(true);
          setErrorMessage((error as any).message || 'Google login failed.');
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === 'error') {
        setIsError(true);
        setErrorMessage(response.error?.message || 'Google login failed.');
      }
    };
    handleGoogleResponse();
  }, [response]);

  useEffect(() => {
    const handleFacebookResponse = async () => {
      if (facebookResponse?.type === 'success' && facebookResponse.params.access_token) {
        setIsLoading(true);
        try {
          const data = await ApiService.auth.loginWithFacebook(facebookResponse.params.access_token);
          router.push('/pages/home/home');
        } catch (error: any) {
          setIsError(true);
          setErrorMessage(error?.message || 'Facebook login failed.');
        } finally {
          setIsLoading(false);
        }
      } else if (facebookResponse?.type === 'error') {
        setIsError(true);
        setErrorMessage(facebookResponse.error?.message || 'Facebook login failed.');
      }
    };
    handleFacebookResponse();
  }, [facebookResponse]);

  const handleLogin = async () => {
    if (!email || !password) {
      setIsError(true);
      setErrorMessage('Please enter email and password');
      return;
    }

    // Check network again before attempting login
    const connected = await NetworkHelper.isConnected();
    if (!connected) {
      setIsError(true);
      setErrorMessage('No internet connection. Please check your network settings.');
      return;
    }

    setIsLoading(true);
    setIsError(false);
    
    try {
      // Use ApiService with role validation
      const expectedRole = role === 'admin' ? UserRole.ADMIN : UserRole.USER;
      const data = await ApiService.auth.login(email, password, expectedRole);
      
      // Verify token was stored
      const storedToken = await AsyncStorage.getItem('token');
      
      // ADMIN: Nếu có message yêu cầu cập nhật profile và có cafeId, ép chuyển trang cập nhật business
      if (role === 'admin' && data.message && data.cafeId) {
        // Hiện alert bắt buộc cập nhật, không cho cancel
        Alert.alert(
          'Thông báo',
          data.message,
          [
            {
              text: 'Cập nhật ngay',
              onPress: () => router.replace('/pages/business-registration/welcome'),
            },
          ],
          { cancelable: false }
        );
        return;
      }
      
      // User thường hoặc admin đã hoàn thiện profile
      router.push("/pages/home/home");
    } catch (error: any) {
      DebugService.logError('Login error:', error);
      setIsError(true);
      if (error.status === 0) {
        // Network error
        setErrorMessage('Unable to connect to the server. Please check your internet connection or try again later.');
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        setErrorMessage(error.message as string);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Retry connection function
  const retryConnection = async () => {
    setIsLoading(true);
    setErrorMessage('Checking network connection...');
    
    try {
      const connected = await NetworkHelper.isConnected();
      setIsNetworkAvailable(connected);
      
      if (connected) {
        const serverReachable = await NetworkHelper.isServerReachable();
        if (serverReachable) {
          setIsError(false);
          setErrorMessage('');
        } else {
          setIsError(true);
          setErrorMessage('Server is unreachable. Please try again later.');
        }
      } else {
        setIsError(true);
        setErrorMessage('No internet connection. Please check your network settings.');
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage('Failed to check network. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý đăng nhập Google mới
  const handleGoogleLogin = async () => {
    if (role === 'admin') {
      setIsError(true);
      setErrorMessage('Admin không được phép đăng nhập bằng Google.');
      return;
    }
    setIsError(false);
    setErrorMessage('');
    setIsLoading(true);
    await promptAsync();
    setIsLoading(false);
  };

  // Hàm xử lý đăng nhập Facebook
  const handleFacebookLogin = async () => {
    if (role === 'admin') {
      setIsError(true);
      setErrorMessage('Admin không được phép đăng nhập bằng Facebook.');
      return;
    }
    
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    
    try {
      // Mở trình duyệt để đăng nhập Facebook
      const result = await WebBrowser.openAuthSessionAsync(
        'http://localhost:4000/api/auth/facebook/',
        'brewtopia://'
      );
      
      if (result.type === 'success') {
        // Xử lý response từ Facebook
        const response = await fetch(result.url);
        const data = await response.json();
        
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
          router.push('/pages/home/home');
        } else {
          throw new Error('Không thể lấy token từ Facebook');
        }
      }
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error?.message || 'Đăng nhập Facebook thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F6F2']}
        style={styles.container}
      >
        {/* Header với nút back */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={PRIMARY_BROWN} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/images/Logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.title}>
                Đăng nhập {role === 'admin' ? 'doanh nghiệp' : ''}
              </Text>

              {/* Network Status Banner */}
              {!isNetworkAvailable && (
                <View style={styles.networkBanner}>
                  <Ionicons name="cloud-offline-outline" size={20} color="#fff" />
                  <Text style={styles.networkBannerText}>Bạn đang ngoại tuyến</Text>
                  <TouchableOpacity onPress={retryConnection}>
                    <Text style={styles.retryText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ email</Text>
                <View style={[styles.inputWrapper, isError && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#8B6F47" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="helloworld@gmail.com"
                    placeholderTextColor="#A8A8A8"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setIsError(false);
                    }}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={[styles.inputWrapper, isError && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8B6F47" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#A8A8A8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setIsError(false);
                    }}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#8B6F47"
                    />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => router.push("/pages/forgot-password/forgot-password")}
                >
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {isError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color="#FF6B6B" />
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    {errorMessage.includes('network') && (
                      <TouchableOpacity onPress={retryConnection}>
                        <Text style={styles.retryTextInError}>Thử kết nối lại</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  (!isNetworkAvailable || isLoading) && styles.disabledButton
                ]}
                onPress={handleLogin}
                disabled={!isNetworkAvailable || isLoading}
                activeOpacity={0.7}
              >
                <View style={styles.loginButtonContent}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Đăng nhập</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Social Login */}
              {role !== 'admin' && (
                <View style={styles.socialContainer}>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.orText}>Hoặc</Text>
                    <View style={styles.divider} />
                  </View>
                  
                  <View style={styles.socialButtons}>
                    <TouchableOpacity 
                      style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                      onPress={handleFacebookLogin}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <AntDesign name="facebook-square" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.socialButton, { backgroundColor: '#DB4437' }]}
                      onPress={handleGoogleLogin} 
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <AntDesign name="google" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.socialButton, { backgroundColor: '#000000' }]}
                      activeOpacity={0.7}
                    >
                      <AntDesign name="apple1" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Sign up link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push(role === 'admin' 
                  ? `/pages/register/register?role=${role}` 
                  : "/pages/register/register")}>
                  <Text style={styles.signupLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 260,
    height: 75,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B6F47',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    color: PRIMARY_BROWN,
  },
  networkBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  networkBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_BROWN,
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#2C1810',
    borderWidth: 0,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  eyeButton: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  forgotPasswordText: {
    color: '#8B6F47',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  retryTextInError: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: PRIMARY_BROWN,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  orText: {
    color: '#8B6F47',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signupText: {
    color: '#8B6F47',
    fontSize: 15,
  },
  signupLink: {
    color: PRIMARY_BROWN,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
