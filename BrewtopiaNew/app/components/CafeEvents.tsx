import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';
import { MaterialIcons } from '@expo/vector-icons';

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  image: any;
};

export default function CafeEvents({ cafeId }: { cafeId: string }) {
  // Mock events data
  const events: EventItem[] = [
    {
      id: '1',
      title: 'Live Acoustic Friday',
      date: 'Friday, June 30, 2023',
      time: '19:00 - 22:00',
      description: 'Join us for a night of acoustic music with local artists. Enjoy special discounts on selected drinks during the event.',
      image: require('../../assets/images/cafe1.png'),
    },
    {
      id: '2',
      title: 'Coffee Brewing Workshop',
      date: 'Saturday, July 8, 2023',
      time: '10:00 - 12:00',
      description: 'Learn how to brew the perfect cup of coffee with our expert baristas. Workshop includes tasting of different coffee beans.',
      image: require('../../assets/images/cafe2.png'),
    },
    {
      id: '3',
      title: 'Poetry Night',
      date: 'Wednesday, July 12, 2023',
      time: '19:00 - 21:00',
      description: 'Bring your original poems or come to enjoy poetry readings from local talents. Hot beverages will be served.',
      image: require('../../assets/images/cafe3.png'),
    },
  ];

  return (
    <ScrollView style={styles.eventsContainer}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      
      {events.map((event) => (
        <View key={event.id} style={styles.eventCard}>
          <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
          
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.eventInfo}>
              <MaterialIcons name="event" size={16} color="#6E543C" />
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>
            
            <View style={styles.eventInfo}>
              <MaterialIcons name="access-time" size={16} color="#6E543C" />
              <Text style={styles.eventTime}>{event.time}</Text>
            </View>
            
            <Text style={styles.eventDescription}>{event.description}</Text>
            
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  eventsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(16),
    color: '#6E543C',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  eventImage: {
    width: '100%',
    height: verticalScale(180),
  },
  eventContent: {
    padding: moderateScale(16),
  },
  eventTitle: {
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#333333',
    marginBottom: verticalScale(8),
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  eventDate: {
    fontSize: fontScale(14),
    color: '#666666',
    marginLeft: horizontalScale(8),
  },
  eventTime: {
    fontSize: fontScale(14),
    color: '#666666',
    marginLeft: horizontalScale(8),
  },
  eventDescription: {
    fontSize: fontScale(14),
    color: '#333333',
    lineHeight: verticalScale(20),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  registerButton: {
    backgroundColor: '#6E543C',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
}); 