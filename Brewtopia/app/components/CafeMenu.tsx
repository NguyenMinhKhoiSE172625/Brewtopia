import { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Animated, Easing, Dimensions, findNodeHandle, UIManager } from 'react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/scaling';
import { useRouter } from 'expo-router';
import ApiService from '../utils/ApiService';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sửa lại type cho đúng dữ liệu API
interface CoffeeItem {
  _id: string;
  menuId: string;
  category: string;
  name: string;
  price: number;
  image: string;
  bestSeller?: boolean;
}

interface CartItem {
  item: CoffeeItem;
  quantity: number;
}

export default function CafeMenu({ cafeId, menuid }: { cafeId: string; menuid?: string }) {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<CoffeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [showCartModal, setShowCartModal] = useState(false);
  const [flyAnim, setFlyAnim] = useState<{show: boolean, x: Animated.Value, y: Animated.Value, scale: Animated.Value, opacity: Animated.Value, img: string}>({
    show: false, 
    x: new Animated.Value(0), 
    y: new Animated.Value(0), 
    scale: new Animated.Value(1),
    opacity: new Animated.Value(1),
    img: ''
  });
  const cartBtnRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);
  const [cartBtnPos, setCartBtnPos] = useState({x: SCREEN_WIDTH - 56 - 24, y: SCREEN_HEIGHT - 56 - 32});
  const cartBtnScale = useRef(new Animated.Value(1)).current;

  // Tạo refs cho tất cả menu items - chỉ tạo khi cần thiết
  const itemRefs = useMemo(() => {
    const refs: Record<string, any> = {};
    menuItems.forEach(item => {
      if (!refs[item._id]) {
        refs[item._id] = { current: null };
      }
    });
    return refs;
  }, [menuItems.length]); // Chỉ re-create khi length thay đổi

  useEffect(() => {
    const idToUse = menuid || cafeId;
    
    const fetchMenuItems = async () => {
      if (!idToUse) {
        setMenuItems([]);
        return;
      }
      
      setLoading(true);
      try {
        // Thử gọi trực tiếp menu-items trước
        console.log('CafeMenu - Trying /menu-items/', idToUse);
        const itemsData = await ApiService.fetch(`/menu-items/${idToUse}`);
        console.log('CafeMenu - Direct menu-items response:', itemsData);
        
        if (Array.isArray(itemsData) && itemsData.length > 0) {
          setMenuItems(itemsData);
          return;
        }
        
        // Nếu không có items, thử gọi /menus để lấy menu trước
        console.log('CafeMenu - No items found, trying /menus/', idToUse);
        const menuData = await ApiService.fetch(`/menus/${idToUse}`);
        console.log('CafeMenu - Menu response:', menuData);
        
        if (Array.isArray(menuData) && menuData.length > 0) {
          // Lấy menu đầu tiên và gọi items
          const firstMenu = menuData[0];
          console.log('CafeMenu - First menu:', firstMenu);
          
          if (firstMenu._id) {
            console.log('CafeMenu - Trying /menu-items/', firstMenu._id);
            const itemsData2 = await ApiService.fetch(`/menu-items/${firstMenu._id}`);
            console.log('CafeMenu - Items from menu response:', itemsData2);
            setMenuItems(Array.isArray(itemsData2) ? itemsData2 : []);
          }
        } else {
          console.log('CafeMenu - No menu found');
          setMenuItems([]);
        }
      } catch (error) {
        console.log('CafeMenu - API error:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [menuid, cafeId]);

  // Lấy vị trí nút giỏ hàng nổi trên màn hình
  useEffect(() => {
    const getCartButtonPosition = () => {
      if (cartBtnRef.current) {
        cartBtnRef.current.measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
          setCartBtnPos({ x: px + w / 2 - 24, y: py + h / 2 - 24 });
        });
      }
    };

    // Lấy vị trí ngay lập tức
    getCartButtonPosition();
    
    // Và sau 500ms để đảm bảo layout đã hoàn thành
    const timer = setTimeout(getCartButtonPosition, 500);
    return () => clearTimeout(timer);
  }, [showCartModal]);

  // Nhóm theo category
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  // Thêm/xoá món trong cart
  const handleAdd = (item: CoffeeItem, imgRef?: any) => {
    // Thêm vào cart trước
    setCart(prev => {
      const prevQty = prev[item._id]?.quantity || 0;
      return {
        ...prev,
        [item._id]: { item, quantity: prevQty + 1 }
      };
    });

    // Hiệu ứng bounce cho nút giỏ hàng
    animateCartButton();

    // Fly-to-cart effect
    if (imgRef?.current && cartBtnRef.current && scrollViewRef.current) {
      try {
        imgRef.current.measureLayout(
          scrollViewRef.current,
          (x: number, y: number, w: number, h: number) => {
            // Tạo animation values mới cho mỗi lần thêm
            const newX = new Animated.Value(x);
            const newY = new Animated.Value(y);
            const newScale = new Animated.Value(1);
            const newOpacity = new Animated.Value(1);

            setFlyAnim({
              show: true, 
              x: newX, 
              y: newY, 
              scale: newScale,
              opacity: newOpacity,
              img: item.image
            });

            // Chạy animation
            Animated.parallel([
              Animated.timing(newX, {
                toValue: cartBtnPos.x,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false
              }),
              Animated.timing(newY, {
                toValue: cartBtnPos.y,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false
              }),
              Animated.timing(newScale, {
                toValue: 0.3,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false
              }),
              Animated.timing(newOpacity, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false
              })
            ]).start(() => {
              setFlyAnim(prev => ({ ...prev, show: false }));
            });
          },
          (error: any) => {
            console.log('Error measuring image position:', error);
            // Nếu không lấy được vị trí, chỉ thêm vào cart mà không có animation
          }
        );
      } catch (error: any) {
        console.log('Error in fly-to-cart animation:', error);
        // Fallback: chỉ thêm vào cart
      }
    }
  };
  const handleRemove = (item: CoffeeItem) => {
    setCart(prev => {
      const prevQty = prev[item._id]?.quantity || 0;
      if (prevQty <= 1) {
        // Xoá khỏi cart
        const newCart = { ...prev };
        delete newCart[item._id];
        return newCart;
      }
      return {
        ...prev,
        [item._id]: { item, quantity: prevQty - 1 }
      };
    });
  };
  const handleClear = (item: CoffeeItem) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[item._id];
      return newCart;
    });
  };

  // Tổng số lượng món trong cart
  const totalItems = Object.values(cart).reduce((sum, ci) => sum + ci.quantity, 0);
  const totalPrice = Object.values(cart).reduce((sum, ci) => sum + ci.quantity * ci.item.price, 0);
  const cartList = Object.values(cart);

  // Hiệu ứng bounce cho nút giỏ hàng
  const animateCartButton = () => {
    Animated.sequence([
      Animated.timing(cartBtnScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cartBtnScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{flex:1}}>
      <ScrollView style={styles.menuContainer} ref={scrollViewRef}>
        {categories.length === 0 && <Text style={{textAlign:'center',marginTop:32}}>Không có món nào</Text>}
        {categories.map(category => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.itemsGrid}>
              {menuItems.filter(item => item.category === category).map((item) => {
                const qty = cart[item._id]?.quantity || 0;
                return (
                  <View key={item._id} style={styles.coffeeItem}>
                    {item.image ? (
                      <Image 
                        ref={(ref) => { itemRefs[item._id].current = ref; }}
                        source={{ uri: item.image }} 
                        style={styles.coffeeImage} 
                        resizeMode="cover" 
                      />
                    ) : null}
                    <View style={styles.coffeeInfo}>
                      <Text style={styles.coffeeName}>{item.name}</Text>
                      <Text style={styles.coffeePrice}>{item.price.toLocaleString()}đ</Text>
                    </View>
                    {/* Nút + */}
                    <TouchableOpacity style={styles.addCartBtn} onPress={() => handleAdd(item, itemRefs[item._id])}>
                      <MaterialIcons name="add-circle" size={32} color="#6E543C" />
                      {qty > 0 && (
                        <View style={styles.cartQtyBadge}>
                          <Text style={styles.cartQtyText}>{qty}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Fly-to-cart effect */}
      {flyAnim.show && (
        <Animated.Image
          source={{ uri: flyAnim.img }}
          style={{
            position: 'absolute',
            width: 60, 
            height: 60,
            borderRadius: 30,
            left: flyAnim.x,
            top: flyAnim.y,
            zIndex: 1000,
            opacity: flyAnim.opacity,
            transform: [
              { scale: flyAnim.scale },
            ],
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }}
        />
      )}
      {/* Nút giỏ hàng nổi cố định */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 24,
              bottom: 32,
              transform: [{ scale: cartBtnScale }],
              zIndex: 100,
            },
          ]}
        >
          <TouchableOpacity ref={cartBtnRef} style={styles.fabCart} onPress={() => setShowCartModal(true)}>
            <MaterialIcons name="shopping-cart" size={32} color="#fff" />
            {totalItems > 0 && (
              <View style={styles.fabCartBadge}>
                <Text style={styles.fabCartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
      {/* Modal cart */}
      <Modal visible={showCartModal} transparent animationType="slide" onRequestClose={() => setShowCartModal(false)}>
        <View style={styles.cartModalOverlay}>
          <View style={styles.cartModalContent}>
            <Text style={styles.cartModalTitle}>Giỏ hàng</Text>
            {cartList.length === 0 ? (
              <Text style={{textAlign:'center',marginTop:32}}>Chưa có món nào</Text>
            ) : (
              <ScrollView style={{maxHeight:300}}>
                {cartList.map(ci => (
                  <View key={ci.item._id} style={styles.cartModalItem}>
                    <Image source={{ uri: ci.item.image }} style={styles.cartModalImg} />
                    <View style={{flex:1,marginLeft:8}}>
                      <Text style={styles.cartModalName}>{ci.item.name}</Text>
                      <Text style={styles.cartModalPrice}>{ci.item.price.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.cartModalQtyWrap}>
                      <TouchableOpacity onPress={() => handleRemove(ci.item)}>
                        <MaterialIcons name="remove-circle" size={28} color="#6E543C" />
                      </TouchableOpacity>
                      <Text style={styles.cartModalQty}>{ci.quantity}</Text>
                      <TouchableOpacity onPress={() => handleAdd(ci.item)}>
                        <MaterialIcons name="add-circle" size={28} color="#6E543C" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => handleClear(ci.item)}>
                      <MaterialIcons name="delete" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.cartModalFooter}>
              <Text style={styles.cartModalTotal}>Tổng cộng: <Text style={{color:'#6E543C',fontWeight:'bold'}}>{totalPrice.toLocaleString()}đ</Text></Text>
              <TouchableOpacity style={[styles.cartModalOrderBtn, cartList.length === 0 && {opacity:0.5}]} disabled={cartList.length === 0}
                onPress={() => {
                  setShowCartModal(false);
                  // Chỉ truyền id và quantity
                  const cartToSend = cartList.map(ci => ({ id: ci.item._id, quantity: ci.quantity }));
                  console.log('CafeMenu - Sending to type-selection:');
                  console.log('- cafeId:', cafeId);
                  console.log('- cartToSend:', cartToSend);
                  console.log('- menuid:', menuid);
                  router.push({
                    pathname: 'pages/order/type-selection' as any,
                    params: { cafeId, cart: JSON.stringify(cartToSend), menuid }
                  });
                }}>
                <Text style={styles.cartModalOrderBtnText}>Đặt hàng</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cartModalCloseBtn} onPress={() => setShowCartModal(false)}>
              <MaterialIcons name="close" size={28} color="#6E543C" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  addCartBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    padding: 2,
    zIndex: 2,
  },
  cartQtyBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartQtyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  fabCart: {
    backgroundColor: '#6E543C',
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 10,
  },
  fabCartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  fabCartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cartModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  cartModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
    maxHeight: '80%',
    position: 'relative',
  },
  cartModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6E543C',
    marginBottom: 12,
    textAlign: 'center',
  },
  cartModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 8,
  },
  cartModalImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  cartModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartModalPrice: {
    fontSize: 14,
    color: '#6E543C',
    marginTop: 2,
  },
  cartModalQtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cartModalQty: {
    minWidth: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6E543C',
    fontSize: 16,
    marginHorizontal: 4,
  },
  cartModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  cartModalTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartModalOrderBtn: {
    backgroundColor: '#6E543C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cartModalOrderBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartModalCloseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
}); 