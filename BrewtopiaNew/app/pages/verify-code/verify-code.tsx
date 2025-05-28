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
  const [successMessage, setSuccessMessage] = useState('');
  
  // Create a ref array for TextInputs
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Get email and role from registration
  useEffect(() => {
    const getEmailAndRole = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('registration_email');
        const savedRole = await AsyncStorage.getItem('registration_role');
        if (savedEmail) {
          setEmail(savedEmail);
          DebugService.log('Retrieved email for verification', savedEmail);
          if (savedRole) {
            DebugService.log('Retrieved role for verification', savedRole);
          }
        } else {
          setIsError(true);
          setErrorMessage('Email not found. Please register again.');
        }
      } catch (error) {
        DebugService.logError('Error retrieving email and role', error);
        setIsError(true);
        setErrorMessage('An error occurred while retrieving registration data.');
      }
    };
    
    getEmailAndRole();
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
      setErrorMessage('Email not found. Please register again.');
      return;
    }

    setIsLoading(true);

    try {
      // Call verification API using ApiService
      await ApiService.auth.verifyCode(email, verificationCode);
      
      // Verification successful
      setIsSuccess(true);
      setIsError(false);
      setSuccessMessage('Verification successful! Redirecting...');
      
      // Get saved role
      const savedRole = await AsyncStorage.getItem('registration_role');
      
      // Clear stored data after successful verification
      await AsyncStorage.removeItem('registration_email');
      await AsyncStorage.removeItem('registration_role');
      
      // Navigate to login page for both admin and user
      setTimeout(() => {
        if (savedRole === 'admin') {
          router.push("/pages/login-user/login-user?role=admin");
        } else {
          router.push("/pages/login-user/login-user");
        }
      }, 2000);
    } catch (error: any) {
      DebugService.logError('Verification API error', error);
      setIsError(true);
      setErrorMessage(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!email) {
      setIsError(true);
      setErrorMessage('Email not found. Please register again.');
      return;
    }

    setIsLoading(true);

    try {
      // Call verification API to resend code using ApiService
      await ApiService.auth.resendVerificationCode(email);
      
      // Code resent successfully
      setTimeLeft(60);
      setCode(['', '', '', '']);
      setIsError(false);
      setIsSuccess(true);
      setSuccessMessage('Verification code has been resent to your email');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error: any) {
      DebugService.logError('Resend verification code error', error);
      setIsError(true);
      setErrorMessage(error.message || 'Failed to resend verification code');
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
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to your email{email ? `: ${email}` : ''}
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
            <Text style={styles.successText}>{successMessage}</Text>
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
                {isLoading ? 'Sending...' : 'Resend Code'}
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