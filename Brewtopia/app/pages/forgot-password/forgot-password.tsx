import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import ApiService from '../../utils/ApiService';
import DebugService from '../../utils/DebugService';
import AppLoading from '../../components/AppLoading';

export default function ForgotPassword() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  
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
      setErrorMessage('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setIsError(true);
      setErrorMessage('Invalid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the forgot password API using the ApiService
      await ApiService.auth.forgotPassword(email);
      
      // Success
      setIsSuccess(true);
      setSuccessMessage('Password reset instructions have been sent to your email');
      
    } catch (error: any) {
      // Error handling
      setIsError(true);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        setErrorMessage(error.message as string);
      } else {
        setErrorMessage('Unable to reset password');
      }
      DebugService.logError('Forgot password error', error);
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
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>Don't worry! Please enter the email address associated with your account.</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                isError && styles.inputError
              ]}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setIsError(false);
                setIsSuccess(false);
              }}
              editable={!isLoading}
            />
          </View>

          {/* Error Message */}
          {isError && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* Success Message */}
          {isSuccess && (
            <Text style={styles.successText}>{successMessage}</Text>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <AppLoading text="Đang gửi mã..." />
          )}

          {/* Send Code Button */}
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              {
                height: 50 * scale,
                borderRadius: 10 * scale,
                opacity: isLoading ? 0.7 : 1
              }
            ]}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Send Instructions</Text>
          </TouchableOpacity>
        </View>

        {/* Remember password */}
        <View style={styles.rememberContainer}>
          <Text style={styles.rememberText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
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
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
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
  sendButton: {
    backgroundColor: '#B68D5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  rememberText: {
    color: '#000000',
  },
  loginLink: {
    color: '#000000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 