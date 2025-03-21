import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';

export default function VerifyCode() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(screenWidth / 431, screenHeight / 956);
  const [timeLeft, setTimeLeft] = useState(20);
  const [code, setCode] = useState(['', '', '', '', '']);
  const [isError, setIsError] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setIsError(false);

    // Auto-focus next input
    if (text && index < 4) {
      inputRefs.current[index + 1].focus();
    }

    // Check if code is complete
    if (index === 4 && text) {
      const fullCode = newCode.join('');
      if (fullCode === '12345') {
        router.push("/pages/login-user/login-user");
      } else {
        setIsError(true);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

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
            {[0, 1, 2, 3, 4].map((index) => (
              <View 
                key={index} 
                style={[
                  styles.codeBox,
                  isError && styles.codeBoxError
                ]}
              >
                <TextInput
                  ref={ref => inputRefs.current[index] = ref}
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                  value={code[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              </View>
            ))}
          </View>

          {/* Error Message */}
          {isError && (
            <Text style={styles.errorText}>Wrong code</Text>
          )}

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => {
                setTimeLeft(20);
                setCode(['', '', '', '', '']);
                setIsError(false);
              }}
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
  codeBoxError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  codeInput: {
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
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