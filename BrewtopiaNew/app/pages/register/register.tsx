import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

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
            <Text style={styles.title}>Create {role === 'admin' ? 'Business' : 'User'} Account</Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Your username"
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
                placeholder="Your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
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
                  <Ionicons name="checkbox" size={24} color="#FFFFFF" />
                ) : (
                  <Ionicons name="square-outline" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <Text style={styles.terms}>
                I accept the terms and privacy policy
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
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <Text style={styles.policyText}>
              By creating an account or signing in, you agree to our{' '}
              <Text style={styles.linkText}>Terms</Text> and{' '}
              <Text style={styles.linkText}>Conditions</Text>
            </Text>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Login</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    paddingRight: moderateScale(15),
  },
  eyeButton: {
    padding: moderateScale(5),
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  checkbox: {
    marginRight: horizontalScale(10),
  },
  terms: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    flex: 1,
  },
  registerButton: {
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
  policyText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(30),
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
  },
  loginLink: {
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: fontScale(14),
  },
  disabledButton: {
    opacity: 0.6,
  },
});