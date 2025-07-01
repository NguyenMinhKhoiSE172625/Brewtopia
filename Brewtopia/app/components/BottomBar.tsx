import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';
import { globalStyles } from '../utils/styles';

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Gần đây',
      icon: 'place',
      route: '/pages/nearby',
    },
    {
      name: 'Tin tức',
      icon: 'article',
      route: '/pages/news/news',
    },
    {
      name: 'Trang chủ',
      icon: 'home',
      route: '/pages/home/home',
    },
    {
      name: 'Stream',
      icon: 'videocam',
      route: '/pages/stream/stream',
    },
    {
      name: 'Hồ sơ',
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
          style={[
            styles.tab,
            isActiveTab(tab.route) && styles.tabActive,
          ]}
          onPress={() => handleNavigation(tab.route)}
        >
          <MaterialIcons
            name={tab.icon as any}
            size={26}
            color={isActiveTab(tab.route) ? '#6E543C' : '#666666'}
          />
          <Text
            style={[
              styles.tabText,
              globalStyles.text,
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
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    minWidth: horizontalScale(60),
  },
  tabText: {
    fontSize: fontScale(13),
    color: '#666666',
    marginTop: verticalScale(2),
    fontWeight: '400',
  },
  tabTextActive: {
    color: '#6E543C',
    fontWeight: '600',
  },
  tabActive: {
    backgroundColor: '#F9F7F4',
  },
}); 