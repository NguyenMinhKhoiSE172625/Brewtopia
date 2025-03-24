import { Text, View, TouchableOpacity, StyleSheet, Image, ImageBackground, Dimensions, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";

export default function Role() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Tính toán tỷ lệ so với design gốc
  const scale = Math.min(screenWidth / 431, screenHeight / 956);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, {
        width: screenWidth,
        height: screenHeight,
        borderRadius: 50 * scale,
      }]}>
        {/* Background chính */}
        <View style={styles.mainBackground}>
          {/* Background mờ với logo */}
          <ImageBackground 
            source={require('../../../assets/images/Logo2.png')} 
            style={[styles.blurredBackground, {
              width: screenWidth * 2,
              height: screenWidth * 2,
            }]}
            resizeMode="contain"
            blurRadius={2}
          />
          
          {/* Logo và Slogan */}
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
            <Text style={[styles.slogan, {
              marginTop: 50 * scale,
              width: 360 * scale,
            }]}></Text>
          </View>
          
          {/* Container nâu cho các nút */}
          <View style={[styles.brownContainer, {
            width: 407 * scale,
            height: 353 * scale,
            marginTop: 381 * scale,
            borderRadius: 31 * scale,
          }]}>
            {/* Container cho các nút đăng nhập */}
            <View style={[styles.loginContainer, {
              width: 368 * scale,
            }]}>
              <TouchableOpacity 
                style={[styles.loginButton, {
                  height: 89 * scale,
                  marginBottom: 60 * scale,
                  borderRadius: 10 * scale,
                }]}
                onPress={() => router.push("/pages/login/login")}
              >
                <Text style={styles.buttonText}>NGƯỜI DÙNG</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, {
                  height: 89 * scale,
                  borderRadius: 10 * scale,
                }]}
                onPress={() => router.push("/pages/login/login?role=admin")}
              >
                <Text style={styles.buttonText}>DOANH NGHIỆP</Text>
              </TouchableOpacity>
            </View>
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
  },
  container: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mainBackground: {
    flex: 1,
    alignItems: 'center',
  },
  blurredBackground: {
    position: 'absolute',
    opacity: 0.1,
    transform: [{ rotate: '-7.27deg' }],
    top: '10%',
    left: '-50%',
  },
  headerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#4B3621',
  },
  brownContainer: {
    position: 'absolute',
    backgroundColor: '#6E543C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000000',
  },
});
