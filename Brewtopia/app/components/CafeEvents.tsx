import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import ApiService from '../utils/ApiService';

export default function CafeEvents({ cafeId }: { cafeId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cafeId) {
      setLoading(true);
      ApiService.fetch(`/events/${cafeId}`)
        .then((data: any) => setEvents(Array.isArray(data) ? data : []))
        .catch(() => setEvents([]))
        .finally(() => setLoading(false));
    }
  }, [cafeId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!events.length) return <Text style={{ margin: 24, color: '#999' }}>Chưa có sự kiện nào</Text>;

  return (
    <View style={{ padding: 16 }}>
      {events.map(item => (
        <View key={item._id} style={styles.eventCard}>
          <Image source={{ uri: item.image }} style={styles.eventImage} />
            <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDesc}>{item.description}</Text>
            <Text style={styles.eventMeta}>
              {item.Countfollower} người quan tâm • {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  eventImage: {
    width: 100,
    height: 100,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  eventDesc: {
    color: '#555',
    marginBottom: 6,
  },
  eventMeta: {
    color: '#999',
    fontSize: 12,
  },
}); 