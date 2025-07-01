import { Text, View, TouchableOpacity, StyleSheet, Image, Dimensions, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_BROWN } from '../../config/constants';

export default function Role() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F6F2']}
        style={styles.container}
      >
        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Card chọn loại tài khoản */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chọn loại tài khoản</Text>
              
              <TouchableOpacity 
                style={styles.roleButton}
                onPress={() => router.push("/pages/login/login")}
                activeOpacity={0.7}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person" size={24} color={PRIMARY_BROWN} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>KHÁCH HÀNG</Text>
                    <Text style={styles.buttonSubtext}>Tìm kiếm và đặt bàn cafe</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={PRIMARY_BROWN} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleButton}
                onPress={() => router.push("/pages/login/login?role=admin")}
                activeOpacity={0.7}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="business" size={24} color={PRIMARY_BROWN} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>DOANH NGHIỆP</Text>
                    <Text style={styles.buttonSubtext}>Quản lý quán cafe của bạn</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={PRIMARY_BROWN} />
                </View>
              </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 260,
    height: 75,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B6F47',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardContainer: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY_BROWN,
    marginBottom: 24,
    textAlign: 'center',
  },
  roleButton: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F1EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_BROWN,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#8B6F47',
    fontWeight: '400',
  },
});
