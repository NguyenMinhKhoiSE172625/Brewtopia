import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';

export default function ForgotPassword() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);

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
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>Don't worry! It happens. Please enter the email associated with your account.</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          {/* Send Code Button */}
          <TouchableOpacity 
            style={[styles.sendButton, {
              height: 50 * scale,
              borderRadius: 10 * scale,
            }]}
            onPress={() => router.push("/pages/login-user/login-user")}
          >
            <Text style={styles.buttonText}>Send code</Text>
          </TouchableOpacity>
        </View>

        {/* Remember password */}
        <View style={styles.rememberContainer}>
          <Text style={styles.rememberText}>Remember password? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Log in</Text>
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