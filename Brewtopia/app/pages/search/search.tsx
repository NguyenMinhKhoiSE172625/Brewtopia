import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, SafeAreaView, ScrollView, FlatList, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/scaling';

interface RecommendedItem {
  id: string;
  image: any;
}

interface Product {
  id: string;
  name: string;
  image: any;
  price: string;
  description: string;
  recommended: RecommendedItem[];
}

export default function Search() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Recent hot items
  const recentHotItems = [
    { id: '1', name: 'matcha latte', trending: true },
    { id: '2', name: 'flat white', trending: true },
    { id: '3', name: 'cappuccino', trending: true },
    { id: '4', name: 'oreo chocolate', trending: true },
    { id: '5', name: 'banana smoothie', trending: true },
  ];

  // Recommended cafes
  const recommendedCafes = [
    {
      id: '1',
      name: 'Xofa Cafe & Bistro',
      image: require('../../../assets/images/cafe1.png'),
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      openStatus: 'Open 24/7',
      isFavorite: false
    },
    {
      id: '2',
      name: 'Homeless Coffee House',
      image: require('../../../assets/images/cafe2.png'),
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      openStatus: 'Open 24/7',
      isFavorite: false
    },
    {
      id: '3',
      name: 'The Coffee Factory',
      image: require('../../../assets/images/quan1.jpg'),
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      openStatus: 'Open 24/7',
      isFavorite: false
    },
    {
      id: '4',
      name: 'Urban Roasters',
      image: require('../../../assets/images/quan2.jpg'),
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      openStatus: 'Open 24/7',
      isFavorite: false
    }
  ];

  // Recommended drinks data
  const recommendedDrinks = [
    {
      id: '1',
      name: 'Salt Coffee',
      image: require('../../../assets/images/mon1.png'),
      price: '3$',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      recommended: [
        { id: '1', image: require('../../../assets/images/mon2.png') },
        { id: '2', image: require('../../../assets/images/mon3.png') },
        { id: '3', image: require('../../../assets/images/cafe1.png') },
      ]
    },
    {
      id: '2',
      name: 'Matcha Green Tea',
      image: require('../../../assets/images/mon2.png'),
      price: '4$',
      description: 'Special green tea with cream and boba pearls.',
      recommended: [
        { id: '1', image: require('../../../assets/images/mon1.png') },
        { id: '2', image: require('../../../assets/images/mon3.png') },
        { id: '3', image: require('../../../assets/images/cafe2.png') },
      ]
    },
    {
      id: '3',
      name: 'Oreo Milkshake',
      image: require('../../../assets/images/mon3.png'),
      price: '5$',
      description: 'Creamy milkshake with crushed oreos and whipped cream.',
      recommended: [
        { id: '1', image: require('../../../assets/images/mon1.png') },
        { id: '2', image: require('../../../assets/images/mon2.png') },
        { id: '3', image: require('../../../assets/images/cafe3.png') },
      ]
    },
    {
      id: '4',
      name: 'Caramel Macchiato',
      image: require('../../../assets/images/cafe4.png'),
      price: '4.5$',
      description: 'Espresso with steamed milk and vanilla-flavored syrup, topped with caramel.',
      recommended: [
        { id: '1', image: require('../../../assets/images/mon1.png') },
        { id: '2', image: require('../../../assets/images/mon2.png') },
        { id: '3', image: require('../../../assets/images/mon3.png') },
      ]
    },
  ];

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const renderRecentHotItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recentHotItem}>
      <View style={styles.trendingIcon}>
        <MaterialIcons name="trending-up" size={16} color="#FF0000" />
      </View>
      <Text style={styles.recentHotText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCafeItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.cafeCard}>
      <Image source={item.image} style={styles.cafeImage} />
      <View style={styles.cafeInfo}>
        <View style={styles.cafeHeader}>
          <Text style={styles.cafeName}>{item.name}</Text>
          <TouchableOpacity>
            <MaterialIcons name="favorite-border" size={24} color="#FF0000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cafeDescription}>{item.description}</Text>
        <Text style={styles.openStatus}>{item.openStatus}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDrinkItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.drinkCard}
      onPress={() => setSelectedProduct(item)}
    >
      <Image source={item.image} style={styles.drinkImage} />
    </TouchableOpacity>
  );

  const renderRecommendedItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recommendedItem}>
      <Image source={item.image} style={styles.recommendedImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button and location */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#6E543C" />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Location</Text>
          <View style={styles.locationValue}>
            <Text style={styles.locationText}>Ho Chi Minh, Viet Nam</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#6E543C" />
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Are you thirsty?"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: horizontalScale(12) }}
        >
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <MaterialIcons 
              name="menu" 
              size={20} 
              color={selectedFilter === 'all' ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'cafe' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('cafe')}
          >
            <Text style={[styles.filterText, selectedFilter === 'cafe' && styles.filterTextActive]}>Cafe</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'distance' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('distance')}
          >
            <Text style={[styles.filterText, selectedFilter === 'distance' && styles.filterTextActive]}>Distance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'opening' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('opening')}
          >
            <Text style={[styles.filterText, selectedFilter === 'opening' && styles.filterTextActive]}>Opening</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedFilter === 'discount' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('discount')}
          >
            <Text style={[styles.filterText, selectedFilter === 'discount' && styles.filterTextActive]}>Discount</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {/* Recent Hot Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT HOT</Text>
          <FlatList
            data={recentHotItems}
            renderItem={renderRecentHotItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* BREWTOPIA RECOMMEND Section */}
        <View style={styles.section}>
          <View style={styles.recommendHeader}>
            <Text style={styles.sectionTitle}>BREWTOPIA RECOMMEND</Text>
            <View style={styles.viewOptions}>
              <TouchableOpacity style={styles.viewOption}>
                <MaterialIcons name="view-agenda" size={24} color="#6E543C" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.viewOption, styles.viewOptionActive]}>
                <MaterialIcons name="grid-view" size={24} color="#6E543C" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Popular Drinks</Text>
          <View style={styles.drinksGrid}>
            {recommendedDrinks.map((drink) => (
              <TouchableOpacity 
                key={drink.id}
                style={styles.drinkCardGrid}
                onPress={() => setSelectedProduct(drink)}
              >
                <Image source={drink.image} style={styles.drinkImage} />
                <View style={styles.drinkInfo}>
                  <Text style={styles.drinkName}>{drink.name}</Text>
                  <Text style={styles.drinkPrice}>{drink.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.subSectionTitle}>Popular Cafes</Text>
          <View style={styles.cafeList}>
            {recommendedCafes.map((cafe) => (
              <TouchableOpacity key={cafe.id} style={styles.cafeCard}>
                <Image source={cafe.image} style={styles.cafeImage} />
                <View style={styles.cafeInfo}>
                  <View style={styles.cafeHeader}>
                    <Text style={styles.cafeName}>{cafe.name}</Text>
                    <TouchableOpacity>
                      <MaterialIcons name="favorite-border" size={24} color="#FF0000" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cafeDescription}>{cafe.description}</Text>
                  <Text style={styles.openStatus}>{cafe.openStatus}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal
        visible={selectedProduct !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedProduct(null)}
            >
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>

            {selectedProduct && (
              <ScrollView>
                <Image source={selectedProduct.image} style={styles.modalImage} />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
                  <Text style={styles.modalPrice}>Price: {selectedProduct.price}</Text>
                  
                  <Text style={styles.recommendedTitle}>Recommended</Text>
                  <FlatList
                    data={selectedProduct.recommended}
                    renderItem={renderRecommendedItem}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recommendedList}
                    initialNumToRender={2}
                    maxToRenderPerBatch={2}
                    windowSize={2}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                    getItemLayout={(data, index) => ({
                      length: horizontalScale(120), // Adjust this based on your item width
                      offset: horizontalScale(120) * index,
                      index,
                    })}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    gap: horizontalScale(16),
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: fontScale(12),
    color: '#999',
  },
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: fontScale(16),
    color: '#6E543C',
    fontWeight: '600',
  },
  searchContainer: {
    padding: moderateScale(16),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(8),
    fontSize: fontScale(16),
    color: '#000',
  },
  filterContainer: {
    backgroundColor: '#F5F5F5',
    paddingVertical: verticalScale(8),
  },
  filterButton: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    marginHorizontal: horizontalScale(4),
    borderRadius: moderateScale(30),
    backgroundColor: '#FFFFFF',
    minWidth: horizontalScale(80),
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6E543C',
  },
  filterText: {
    fontSize: fontScale(14),
    color: '#000000',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: moderateScale(16),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(16),
  },
  recentHotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(8),
  },
  trendingIcon: {
    marginRight: horizontalScale(4),
  },
  recentHotText: {
    fontSize: fontScale(14),
    color: '#000',
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  viewOptions: {
    flexDirection: 'row',
    gap: horizontalScale(8),
  },
  viewOption: {
    padding: moderateScale(4),
  },
  viewOptionActive: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(4),
  },
  cafeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(4),
    marginHorizontal: horizontalScale(2),
  },
  cafeImage: {
    width: '100%',
    height: verticalScale(200),
    resizeMode: 'cover',
    backgroundColor: '#F5F5F5',
  },
  cafeInfo: {
    padding: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    marginTop: verticalScale(-20),
  },
  cafeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  cafeName: {
    fontSize: fontScale(16),
    fontWeight: '600',
    color: '#6E543C',
    flex: 1,
  },
  cafeDescription: {
    fontSize: fontScale(14),
    color: '#666666',
    marginBottom: verticalScale(8),
  },
  openStatus: {
    fontSize: fontScale(14),
    color: '#00B207',
    fontWeight: '500',
  },
  drinksContainer: {
    paddingHorizontal: horizontalScale(4),
    gap: horizontalScale(12),
  },
  drinkCard: {
    width: horizontalScale(160),
    height: verticalScale(200),
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(3),
    padding: moderateScale(8),
  },
  drinkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: moderateScale(16),
  },
  cafeList: {
    marginTop: verticalScale(16),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    minHeight: '80%',
    padding: moderateScale(16),
  },
  closeButton: {
    position: 'absolute',
    right: moderateScale(16),
    top: moderateScale(16),
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(4),
  },
  modalImage: {
    width: '100%',
    height: verticalScale(300),
    resizeMode: 'cover',
    borderRadius: moderateScale(20),
  },
  modalInfo: {
    padding: moderateScale(16),
  },
  modalTitle: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(8),
  },
  modalDescription: {
    fontSize: fontScale(16),
    color: '#666666',
    marginBottom: verticalScale(16),
  },
  modalPrice: {
    fontSize: fontScale(20),
    fontWeight: '600',
    color: '#00B207',
    marginBottom: verticalScale(24),
  },
  recommendedTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#6E543C',
    marginBottom: verticalScale(12),
  },
  recommendedList: {
    gap: horizontalScale(12),
  },
  recommendedItem: {
    width: horizontalScale(100),
    height: verticalScale(100),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(3),
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  subSectionTitle: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#666666',
    marginBottom: verticalScale(12),
    marginTop: verticalScale(8),
  },
  drinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: moderateScale(12),
    marginBottom: verticalScale(24),
  },
  drinkCardGrid: {
    width: '48%',
    height: verticalScale(200),
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(3),
  },
  drinkInfo: {
    padding: moderateScale(8),
    height: '25%',
    justifyContent: 'space-between',
  },
  drinkName: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#6E543C',
  },
  drinkPrice: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#00B207',
  },
}); 