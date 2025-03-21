import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

export default function VerifyCode() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  const [timeLeft, setTimeLeft] = useState(20); // 20 seconds countdown

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

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
          <Text style={styles.title}>Enter code</Text>
          <Text style={styles.subtitle}>We've sent an SMS with an activation code to your phone +33 2 94 27 84 11</Text>

          {/* Code Input Container */}
          <View style={styles.codeContainer}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={styles.codeBox}>
                <TextInput
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => setTimeLeft(20)}
              disabled={timeLeft > 0}
            >
              <Text style={[styles.resendText, timeLeft > 0 && styles.resendTextDisabled]}>
                Send code again
              </Text>
            </TouchableOpacity>
            {timeLeft > 0 && (
              <Text style={styles.timer}>
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                {String(timeLeft % 60).padStart(2, '0')}
              </Text>
            )}
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
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  codeBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  codeInput: {
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendButton: {
    marginRight: 10,
  },
  resendText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 14,
  },
}); 