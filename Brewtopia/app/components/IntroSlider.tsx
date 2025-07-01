import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface IntroSliderProps {
  onFinish: () => void;
}

const IntroSlider: React.FC<IntroSliderProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const slides = [
    {
      id: 1,
      title: 'Chào mừng đến với Brewtopia',
      subtitle: 'Khám phá thế giới cà phê',
      description: 'Ứng dụng giúp bạn tìm kiếm và đặt món từ các quán cà phê yêu thích một cách dễ dàng',
      image: require('../../assets/images/slide1.png'),
      backgroundColor: '#F8F4F0',
    },
    {
      id: 2,
      title: 'Đặt món nhanh chóng',
      subtitle: 'Tiết kiệm thời gian',
      description: 'Đặt trước đồ uống yêu thích và nhận tại quán mà không cần chờ đợi',
      image: require('../../assets/images/slide2.png'),
      backgroundColor: '#F5F2EE',
    },
    {
      id: 3,
      title: 'Khám phá quán mới',
      subtitle: 'Trải nghiệm đa dạng',
      description: 'Tìm kiếm các quán cà phê gần bạn và khám phá những hương vị mới lạ',
      image: require('../../assets/images/slide3.png'),
      backgroundColor: '#F0F5F0',
    },
  ];

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const renderSlide = (slide: any, index: number) => (
    <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
      <View style={styles.slideContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image source={slide.image} style={styles.slideImage} resizeMode="cover" />
            <View style={styles.imageOverlay} />
          </View>
        </View>
        
        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </View>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex ? '#6B4423' : '#E5E5E5',
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderDots()}
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Bắt đầu' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipText: {
    fontSize: 14,
    color: '#6B4423',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  imageContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  slideImage: {
    width: screenWidth * 0.75,
    height: screenHeight * 0.35,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(107, 68, 35, 0.08)',
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: screenWidth - 60,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C1810',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  slideSubtitle: {
    fontSize: 17,
    color: '#6B4423',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  slideDescription: {
    fontSize: 15,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#6B4423',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: screenWidth - 80,
    alignItems: 'center',
    shadowColor: '#6B4423',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IntroSlider; 