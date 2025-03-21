import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Nearby',
      icon: 'place',
      route: '/pages/nearby/nearby',
    },
    {
      name: 'News',
      icon: 'article',
      route: '/pages/news/news',
    },
    {
      name: 'Home',
      icon: 'home',
      route: '/pages/home/home',
    },
    {
      name: 'Stream',
      icon: 'videocam',
      route: '/pages/stream/stream',
    },
    {
      name: 'Profile',
      icon: 'person',
      route: '/pages/profile/profile',
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const isActiveTab = (route: string) => {
    if (route === '/pages/home/home' && pathname === '/') {
      return true;
    }
    return pathname === route;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => handleNavigation(tab.route)}
        >
          <MaterialIcons
            name={tab.icon as any}
            size={24}
            color={isActiveTab(tab.route) ? '#6E543C' : '#999999'}
          />
          <Text
            style={[
              styles.tabText,
              isActiveTab(tab.route) && styles.tabTextActive,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(12),
  },
  tabText: {
    fontSize: fontScale(12),
    color: '#999999',
    marginTop: verticalScale(4),
  },
  tabTextActive: {
    color: '#6E543C',
    fontWeight: '500',
  },
}); 