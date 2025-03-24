import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../utils/ApiService';
import DebugService from '../../utils/DebugService';
import UserRoleHelper, { UserRole } from '../../utils/UserRoleHelper';

export default function LoginUser() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;
  
  // Debug info
  DebugService.log('Login User Screen - Role', role);
  
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setIsError(true);
      setErrorMessage('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      // Use ApiService with role validation
      const expectedRole = role === 'admin' ? UserRole.ADMIN : UserRole.USER;
      const data = await ApiService.auth.login(email, password, expectedRole);
      
      // Login successful
      setIsError(false);
      router.push("/pages/home/home");
    } catch (error: any) {
      setIsError(true);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        setErrorMessage(error.message as string);
      } else {
        setErrorMessage('Đăng nhập thất bại');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, {
        width: 431 * scale,
        height: 956 * scale,
        borderRadius: 50 * scale,
      }]}>
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
          <Text style={styles.title}>Đăng nhập {role === 'admin' ? 'Doanh Nghiệp' : 'Người Dùng'}</Text>

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
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, {
              height: 50 * scale,
              borderRadius: 10 * scale,
              marginTop: 20 * scale,
            }]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.orText}>Or Login with</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text>G</Text>
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
    marginBottom: 30,
    textAlign: 'center',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingRight: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#B68D5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  orText: {
    color: '#FFFFFF',
    marginBottom: 15,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    color: '#FFFFFF',
  },
  signupLink: {
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
