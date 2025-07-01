import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_BROWN } from '../../config/constants';

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;

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

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcome}>
              {role === 'admin' ? 'Chào mừng đối tác kinh doanh' : 'Chào mừng đến với Brewtopia'}
            </Text>
          </View>
          
          {/* Action Card */}
          <View style={styles.actionCard}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.loginButton]}
              onPress={() => router.push(role === 'admin' 
                ? `/pages/login-user/login-user?role=${role}` 
                : "/pages/login-user/login-user")}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="log-in-outline" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.loginText}>Đăng nhập</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.registerButton]}
              onPress={() => router.push(role === 'admin' 
                ? `/pages/register/register?role=${role}` 
                : "/pages/register/register")}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.iconWrapper, styles.registerIconWrapper]}>
                  <Ionicons name="person-add-outline" size={22} color={PRIMARY_BROWN} />
                </View>
                <Text style={styles.registerText}>Tạo tài khoản mới</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Khám phá hàng ngàn quán cafe tuyệt vời
            </Text>
            <View style={styles.coffeeIcons}>
              <Text style={styles.coffeeIcon}>☕</Text>
              <Text style={styles.coffeeIcon}>🧋</Text>
              <Text style={styles.coffeeIcon}>🍰</Text>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 280,
    height: 80,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B6F47',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  welcome: {
    fontSize: 18,
    color: PRIMARY_BROWN,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: PRIMARY_BROWN,
  },
  registerButton: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  registerIconWrapper: {
    backgroundColor: '#F5F1EC',
  },
  loginText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerText: {
    fontSize: 17,
    fontWeight: '600',
    color: PRIMARY_BROWN,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8B6F47',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 16,
  },
  coffeeIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  coffeeIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
}); 