import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";

export default function Welcome() {
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

        {/* Welcome Image */}
        <View style={[styles.imageContainer, {
          marginTop: 30 * scale,
        }]}>
          <Image 
            source={require('../../../assets/images/verifyadmin.png')}
            style={[styles.welcomeImage, {
              width: 400 * scale,
              height: 400 * scale,
            }]}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View style={[styles.textContainer, {
          marginTop: 30 * scale,
          paddingHorizontal: 20 * scale,
        }]}>
          <Text style={styles.title}>Welcome to Brewtopia!</Text>
          <Text style={styles.subtitle}>
            Thank you for joining our community of coffee businesses. Let's get started with setting up your shop profile.
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={[styles.nextButton, {
            marginTop: 30 * scale,
            height: 50 * scale,
            borderRadius: 10 * scale,
          }]}
          onPress={() => router.push("/pages/business-registration/shop-info")}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
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
  imageContainer: {
    alignItems: 'center',
  },
  welcomeImage: {
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#6E543C',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 