import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import DebugService from '../../utils/DebugService';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';
import NetworkHelper from '../../utils/NetworkHelper';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { API_URL } from '../../config/constants';

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
  
  // Debug info
  DebugService.log('Login User Screen - Role', role);
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);

  const redirectUri = 'https://auth.expo.io/@khoiawesome/brewtopia';
  console.log('Google OAuth redirectUri:', redirectUri);

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
      console.log('Attempting login with:', { email, role });
      // Use ApiService with role validation
      const expectedRole = role === 'admin' ? UserRole.ADMIN : UserRole.USER;
      const data = await ApiService.auth.login(email, password, expectedRole);
      
      console.log('Login response:', data);
      
      // Verify token was stored
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Stored token:', storedToken);
      
      // Log cafeId nếu có
      if (data.cafeId) {
        console.log('Đã lưu cafeId:', data.cafeId);
      }
      
      setIsError(false);
      
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
      console.error('Login error:', error);
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
            <Text style={styles.title}>Login {role === 'admin' ? 'Business' : 'User'}</Text>

            {/* Network Status Banner */}
            {!isNetworkAvailable && (
              <View style={styles.networkBanner}>
                <Ionicons name="cloud-offline-outline" size={24} color="#fff" />
                <Text style={styles.networkBannerText}>You are offline</Text>
                <TouchableOpacity onPress={retryConnection}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[
                  styles.input,
                  isError && styles.inputError
                ]}
                placeholder="helloworld@gmail.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setIsError(false);
                }}
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.passwordContainer,
                isError && styles.inputError
              ]}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setIsError(false);
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => router.push("/pages/forgot-password/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {isError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                {errorMessage.includes('network') && (
                  <TouchableOpacity onPress={retryConnection}>
                    <Text style={styles.retryTextInError}>Retry Connection</Text>
                  </TouchableOpacity>
                )}
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
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <Text style={styles.orText}>Or Login with</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={styles.socialButton} 
                  onPress={handleFacebookLogin}
                  disabled={role === 'admin' || isLoading}
                >
                  <AntDesign name="facebook-square" size={24} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.socialButton} 
                  onPress={handleGoogleLogin} 
                  disabled={role === 'admin' || isLoading}
                >
                  <AntDesign name="google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <AntDesign name="apple1" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign up link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push(role === 'admin' 
                ? `/pages/register/register?role=${role}` 
                : "/pages/register/register")}>
                <Text style={styles.signupLink}>Sign up</Text>
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
    backgroundColor: '#6E543C',
    borderRadius: moderateScale(31),
    padding: moderateScale(20),
    width: '100%',
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: verticalScale(30),
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
    fontSize: fontScale(16),
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    fontSize: fontScale(16),
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    paddingRight: moderateScale(15),
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: verticalScale(8),
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  errorText: {
    color: '#FF0000',
    fontSize: fontScale(14),
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#B68D5F',
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(10),
    marginTop: verticalScale(20),
  },
  buttonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: verticalScale(30),
  },
  orText: {
    color: '#FFFFFF',
    marginBottom: verticalScale(15),
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: horizontalScale(20),
  },
  socialButton: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    backgroundColor: '#FFFFFF',
    borderRadius: horizontalScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(30),
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
  },
  signupLink: {
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: fontScale(14),
  },
  networkBanner: {
    backgroundColor: '#E74C3C',
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(15),
  },
  networkBannerText: {
    color: '#FFFFFF',
    marginLeft: horizontalScale(10),
    flex: 1,
  },
  retryText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  retryTextInError: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
    marginTop: verticalScale(5),
  },
  disabledButton: {
    opacity: 0.6,
  },
});
