import { View, StyleSheet, Text, Image, ScrollView } from 'react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';

type CoffeeItem = {
  id: string;
  name: string;
  price: string;
  image: any;
  category: string;
};

export default function CafeMenu({ cafeId }: { cafeId: string }) {
  // Mock coffee menu data
  const coffeeItems: CoffeeItem[] = [
    {
      id: '1',
      name: 'Espresso',
      price: '3.50',
      image: require('../../assets/images/mon1.png'),
      category: 'hot',
    },
    {
      id: '2',
      name: 'Double Espresso',
      price: '4.50',
      image: require('../../assets/images/mon2.png'),
      category: 'hot',
    },
    {
      id: '3',
      name: 'Americano',
      price: '4.00',
      image: require('../../assets/images/mon3.png'),
      category: 'hot',
    },
    {
      id: '4',
      name: 'Flat White',
      price: '4.50',
      image: require('../../assets/images/mon1.png'),
      category: 'hot',
    },
    {
      id: '5',
      name: 'Cafe Latte',
      price: '4.50',
      image: require('../../assets/images/mon2.png'),
      category: 'hot',
    },
    {
      id: '6',
      name: 'Macchiato',
      price: '4.50',
      image: require('../../assets/images/mon3.png'),
      category: 'hot',
    },
    {
      id: '7',
      name: 'Cappuccino',
      price: '4.50',
      image: require('../../assets/images/mon1.png'),
      category: 'hot',
    },
    {
      id: '8',
      name: 'Frappuccino',
      price: '5.50',
      image: require('../../assets/images/mon2.png'),
      category: 'cold',
    },
    {
      id: '9',
      name: 'Cold Brew',
      price: '5.00',
      image: require('../../assets/images/mon3.png'),
      category: 'cold',
    },
    {
      id: '10',
      name: 'Iced Coffee',
      price: '4.50',
      image: require('../../assets/images/mon1.png'),
      category: 'cold',
    },
    {
      id: '11',
      name: 'Iced Latte',
      price: '5.00',
      image: require('../../assets/images/mon2.png'),
      category: 'cold',
    },
  ];

  const hotCoffees = coffeeItems.filter(item => item.category === 'hot');
  const coldCoffees = coffeeItems.filter(item => item.category === 'cold');

  return (
    <ScrollView style={styles.menuContainer}>
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>Hot</Text>
        <View style={styles.itemsGrid}>
          {hotCoffees.map((item) => (
            <View key={item.id} style={styles.coffeeItem}>
              <Image source={item.image} style={styles.coffeeImage} resizeMode="cover" />
              <View style={styles.coffeeInfo}>
                <Text style={styles.coffeeName}>{item.name}</Text>
                <Text style={styles.coffeePrice}>${item.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>Cold</Text>
        <View style={styles.itemsGrid}>
          {coldCoffees.map((item) => (
            <View key={item.id} style={styles.coffeeItem}>
              <Image source={item.image} style={styles.coffeeImage} resizeMode="cover" />
              <View style={styles.coffeeInfo}>
                <Text style={styles.coffeeName}>{item.name}</Text>
                <Text style={styles.coffeePrice}>${item.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: verticalScale(24),
  },
  categoryTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(16),
    color: '#6E543C',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  coffeeItem: {
    width: '48%',
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  coffeeImage: {
    width: '100%',
    height: verticalScale(120),
    borderTopLeftRadius: moderateScale(12),
    borderTopRightRadius: moderateScale(12),
  },
  coffeeInfo: {
    padding: moderateScale(10),
  },
  coffeeName: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#333333',
    marginBottom: verticalScale(4),
  },
  coffeePrice: {
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#6E543C',
  },
}); 