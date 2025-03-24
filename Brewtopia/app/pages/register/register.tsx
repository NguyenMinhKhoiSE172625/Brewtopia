import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setIsError(true);
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
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
      
      const response = await fetch('http://10.0.2.2:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Registration successful
        setIsError(false);
        router.push("/pages/verify-code/verify-code");
      } else {
        // Registration failed
        const errorData = await response.json();
        setIsError(true);
        setErrorMessage(errorData.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsError(true);
      setErrorMessage('Lỗi kết nối đến máy chủ');
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
          <Text style={styles.title}>Tạo tài khoản {role === 'admin' ? 'Doanh Nghiệp' : 'Người Dùng'}</Text>

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
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <Text style={styles.terms}>
            Tôi chấp nhận các điều khoản và chính sách bảo mật
          </Text>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, {
              height: 50 * scale,
              borderRadius: 10 * scale,
            }]}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Đăng Ký</Text>
          </TouchableOpacity>

          <Text style={styles.policyText}>
            Bằng cách tạo tài khoản hoặc đăng nhập, bạn đồng ý với{' '}
            <Text style={styles.linkText}>Điều khoản</Text> và{' '}
            <Text style={styles.linkText}>Điều kiện</Text> của chúng tôi
          </Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  eyeButton: {
    padding: 15,
  },
  terms: {
    color: '#FFFFFF',
    marginVertical: 20,
    fontSize: 14,
  },
  registerButton: {
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
  policyText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
  linkText: {
    textDecorationLine: 'underline',
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
});