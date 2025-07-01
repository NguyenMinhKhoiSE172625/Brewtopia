import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';

interface SponsorBannerProps {
  title?: string;
  showTitle?: boolean;
}

const { width } = Dimensions.get('window');

const SponsorBanner: React.FC<SponsorBannerProps> = ({ 
  title = "Được tài trợ bởi đối tác", 
  showTitle = true 
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Images for the sponsor banner
  const sponsorImages = [
    require('../../assets/images/mon1.png'),
    require('../../assets/images/mon2.png'),
    require('../../assets/images/mon3.png'),
    require('../../assets/images/mon4.png'),
    require('../../assets/images/mon5.png'),
    require('../../assets/images/mon6.png'),
    require('../../assets/images/mon7.png'),
    require('../../assets/images/mon8.png'),
  ];

  // Auto scroll effect
  useEffect(() => {
    let scrollPosition = 0;
    const maxScroll = sponsorImages.length * 120; // Approximate width per image
    
    const intervalId = setInterval(() => {
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
        scrollViewRef.current?.scrollTo({ x: 0, animated: false });
      } else {
        scrollPosition += 1;
        scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: false });
      }
    }, 30); // Speed of scroll
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Display each sponsor image and repeat them for continuous scrolling */}
        {[...sponsorImages, ...sponsorImages].map((image, index) => (
          <TouchableOpacity key={index} style={styles.sponsorItem}>
            <Image
              source={image}
              style={styles.sponsorImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    marginVertical: verticalScale(10),
    padding: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    paddingHorizontal: horizontalScale(5),
  },
  title: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#6E543C',
  },
  viewAll: {
    fontSize: fontScale(14),
    color: '#6E543C',
    textDecorationLine: 'underline',
  },
  scrollView: {
    height: verticalScale(120), // Fixed height for scrolling area
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: verticalScale(5),
  },
  sponsorItem: {
    marginHorizontal: horizontalScale(5),
    borderRadius: moderateScale(10),
    overflow: 'hidden',
  },
  sponsorImage: {
    width: horizontalScale(100),
    height: verticalScale(100),
    borderRadius: moderateScale(10),
  },
});

export default SponsorBanner; 