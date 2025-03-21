import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 904.74);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, {
        width: 431 * scale,
        height: 904.74 * scale,
        borderRadius: 50 * scale,
      }]}>
        {/* Logo */}
        <View style={[styles.headerContainer, {
          marginTop: 108 * scale,
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

        {/* Form đăng nhập */}
        <View style={[styles.formContainer, {
          width: 368 * scale,
          marginTop: 100 * scale,
        }]}>
          <TouchableOpacity 
            style={[styles.loginButton, {
              height: 89 * scale,
              borderRadius: 10 * scale,
              backgroundColor: '#6E543C',
              marginBottom: 20 * scale,
            }]}
            onPress={() => router.push("/pages/login-user/login-user")}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.registerButton, {
              height: 89 * scale,
              borderRadius: 10 * scale,
              borderColor: '#000000',
              borderWidth: 1,
            }]}
            onPress={() => router.push("/pages/register/register")}
          >
            <Text style={[styles.buttonText, { color: '#000000' }]}>Tạo tài khoản</Text>
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
  headerContainer: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  formContainer: {
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 