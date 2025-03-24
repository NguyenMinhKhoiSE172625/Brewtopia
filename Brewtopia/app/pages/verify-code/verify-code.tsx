import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import DebugService from '../../utils/DebugService';

export default function VerifyCode() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [code, setCode] = useState(['', '', '', '']); // Changed to 4 digits
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Create a ref array for TextInputs
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Get email from registration
  useEffect(() => {
    const getEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('registration_email');
        if (savedEmail) {
          setEmail(savedEmail);
          DebugService.log('Retrieved email for verification', savedEmail);
        } else {
          setIsError(true);
          setErrorMessage('Email không được tìm thấy. Vui lòng đăng ký lại.');
        }
      } catch (error) {
        DebugService.logError('Error retrieving email', error);
        setIsError(true);
        setErrorMessage('Đã xảy ra lỗi khi lấy thông tin email.');
      }
    };
    
    getEmail();
  }, []);

  // Timer for resend code
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numeric input
    if (text && !/^\d+$/.test(text)) {
      return;
    }
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    if (isError) {
      setIsError(false);
      setErrorMessage('');
    }

    // Auto-focus next input
    if (text && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if code is complete and submit
    if (index === 3 && text) {
      const fullCode = newCode.join('');
      if (fullCode.length === 4) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (verificationCode: string) => {
    if (!email) {
      setIsError(true);
      setErrorMessage('Email không được tìm thấy. Vui lòng đăng ký lại.');
      return;
    }

    setIsLoading(true);

    try {
      // Call verification API
      const response = await fetch('http://10.0.2.2:4000/api/auth/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Verification successful
        setIsSuccess(true);
        setIsError(false);
        
        // Clear stored email after successful verification
        await AsyncStorage.removeItem('registration_email');
        
        // Navigate to login after 2 seconds
        setTimeout(() => {
          router.push("/pages/login-user/login-user");
        }, 2000);
      } else {
        // Verification failed
        setIsError(true);
        setErrorMessage(data.message || 'Mã xác thực không đúng');
      }
    } catch (error) {
      DebugService.logError('Verification API error', error);
      setIsError(true);
      setErrorMessage('Không thể kết nối đến máy chủ xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!email) {
      setIsError(true);
      setErrorMessage('Email không được tìm thấy. Vui lòng đăng ký lại.');
      return;
    }

    setIsLoading(true);

    try {
      // Call resend code API (you might need to implement this endpoint)
      const response = await fetch('http://10.0.2.2:4000/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Code resent successfully
        setTimeLeft(60);
        setCode(['', '', '', '']);
        setIsError(false);
        setErrorMessage('');
      } else {
        // Resend failed
        setIsError(true);
        setErrorMessage(data.message || 'Không thể gửi lại mã xác thực');
      }
    } catch (error) {
      DebugService.logError('Resend code API error', error);
      setIsError(true);
      setErrorMessage('Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, {
        width: 431 * scale,
        height: 956 * scale,
        borderRadius: 50 * scale,
      }]}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={[styles.headerContainer, {
          marginTop: 50 * scale,
        }]}>
          <Image 
            source={require('../../../assets/images/Logo.png')}
            style={[styles.logo, {
              width: 500 * scale,
              height: 120 * scale,
            }]}
            resizeMode="contain"
          />
        </View>

        {/* Form container */}
        <View style={[styles.formContainer, {
          width: 407 * scale,
          padding: 20 * scale,
          borderRadius: 31 * scale,
          marginTop: 30 * scale,
        }]}>
          <Text style={styles.title}>Nhập mã xác thực</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi mã xác thực đến email của bạn{email ? `: ${email}` : ''}
          </Text>

          {/* Code Input Container */}
          <View style={styles.codeContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View 
                key={index} 
                style={[
                  styles.codeBox,
                  isError && styles.codeBoxError
                ]}
              >
                <TextInput
                  ref={ref => inputRefs.current[index] = ref}
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                  value={code[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  editable={!isLoading && !isSuccess}
                />
              </View>
            ))}
          </View>

          {/* Success Message */}
          {isSuccess && (
            <Text style={styles.successText}>Xác thực thành công! Đang chuyển hướng...</Text>
          )}

          {/* Error Message */}
          {isError && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
          )}

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={resendCode}
              disabled={timeLeft > 0 || isLoading || isSuccess}
            >
              <Text style={[
                styles.resendText, 
                (timeLeft > 0 || isLoading || isSuccess) && styles.resendTextDisabled
              ]}>
                Gửi lại mã
              </Text>
            </TouchableOpacity>
            {timeLeft > 0 && (
              <Text style={styles.timer}>
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                {String(timeLeft % 60).padStart(2, '0')}
              </Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  headerContainer: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#6E543C',
    alignItems: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  codeBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  codeBoxError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  codeInput: {
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: '#FF0000',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  successText: {
    color: '#4CAF50',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendButton: {
    marginRight: 10,
  },
  resendText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  loader: {
    marginVertical: 10,
  },
}); 