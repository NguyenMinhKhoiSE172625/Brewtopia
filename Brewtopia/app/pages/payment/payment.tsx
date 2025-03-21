import { View, Text, StyleSheet, SafeAreaView, Image, TextInput, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

export default function Payment() {
  const [isSaveCard, setIsSaveCard] = useState(false);

  const handleToggleSaveCard = () => {
    setIsSaveCard(previousState => !previousState);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY CARD</Text>
      </View>

      {/* Card Image */}
      <View style={styles.cardContainer}>
        <Image 
          source={require('../../../assets/images/card.png')}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </View>

      {/* Card Input Fields */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Card holder name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>CARD NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="5138 9200 3456 7890"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="***"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Text style={styles.inputLabel}>EXPIRED DATE</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor="#999"
              maxLength={5}
            />
          </View>
        </View>
      </View>

      {/* Save Card Toggle */}
      <View style={styles.saveCardContainer}>
        <Text style={styles.saveCardText}>Save your card information</Text>
        <Switch
          value={isSaveCard}
          onValueChange={handleToggleSaveCard}
          trackColor={{ false: '#D9D9D9', true: '#6E543C' }}
          thumbColor={'#FFFFFF'}
        />
      </View>

      {/* Add Card Button */}
      <TouchableOpacity 
        style={styles.addCardButton}
        onPress={() => router.push("/pages/home/home")}
      >
        <Text style={styles.addCardButtonText}>Add Card</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <MaterialIcons name="location-on" size={24} color="#6E543C" />
          <Text style={styles.navText}>Nearby</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="groups" size={24} color="#6E543C" />
          <Text style={styles.navText}>News</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="home" size={24} color="#6E543C" />
          <Text style={[styles.navText, styles.navTextBold]}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="videocam" size={24} color="#6E543C" />
          <Text style={styles.navText}>Stream</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="person" size={24} color="#6E543C" />
          <Text style={styles.navText}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    paddingTop: verticalScale(20),
  },
  backButton: {
    marginRight: horizontalScale(16),
  },
  headerTitle: {
    fontSize: fontScale(24),
    fontWeight: 'bold',
    color: '#6E543C',
    flex: 1,
    textAlign: 'center',
    marginRight: horizontalScale(40),
  },
  cardContainer: {
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
  },
  cardImage: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: moderateScale(10),
  },
  inputContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  inputWrapper: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(8),
  },
  input: {
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: '#6E543C',
    borderRadius: moderateScale(25),
    paddingHorizontal: horizontalScale(20),
    fontSize: fontScale(16),
    color: '#000000',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
  },
  saveCardText: {
    fontSize: fontScale(16),
    color: '#6E543C',
    fontWeight: '500',
  },
  addCardButton: {
    backgroundColor: '#6E543C',
    marginHorizontal: horizontalScale(20),
    marginTop: verticalScale(30),
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(80),
  },
  addCardButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: moderateScale(8),
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    padding: moderateScale(8),
  },
  navText: {
    fontSize: fontScale(12),
    marginTop: verticalScale(4),
    color: '#6E543C',
  },
  navTextBold: {
    fontWeight: 'bold',
  },
}); 