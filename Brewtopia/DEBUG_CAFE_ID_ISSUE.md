# Debug CafeId Issue

## Vấn đề
- CafeId được lưu: `6848f40cc953f7ca00c2e3a1`
- Nhưng khi vào ShopInfo screen: `cafeId from AsyncStorage: null`
- Khi nhấn Next: `cafeId when Next: null`

## Nguyên nhân có thể
1. **Timing issue**: Screen load trước khi cafeId được lưu hoàn toàn
2. **AsyncStorage key mismatch**: Có thể lưu và đọc khác key
3. **Navigation state**: CafeId bị clear khi navigate
4. **User session**: UserId không tồn tại để tạo cafe

## Giải pháp đã implement

### 1. Cải thiện debug logging
```typescript
// Debug: Check all AsyncStorage keys
const allKeys = await AsyncStorage.getAllKeys();
console.log('ShopInfo - All AsyncStorage keys:', allKeys);
```

### 2. Thêm userId vào AsyncStorage
```typescript
// Trong ApiService login
await AsyncStorage.setItem('userId', response.user.id);
```

### 3. Tự động tạo cafe nếu thiếu
```typescript
const createCafeIfNeeded = async () => {
  // Try userId directly first
  let userId = await AsyncStorage.getItem('userId');
  
  // Fallback to user_data
  if (!userId) {
    const userDataString = await AsyncStorage.getItem('user_data');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      userId = userData.id;
      if (userId) {
        await AsyncStorage.setItem('userId', userId);
      }
    }
  }
  
  if (userId) {
    const cafeResponse = await ApiService.cafe.createCafe(userId);
    if (cafeResponse.id) {
      await AsyncStorage.setItem('cafeId', cafeResponse.id);
      return cafeResponse.id;
    }
  }
  return null;
};
```

### 4. Loading và Error states
- Loading indicator khi đang tải
- Error screen với retry button nếu không tìm thấy cafeId
- Retry logic để tạo lại cafe

### 5. Backup logic trong handleNext
```typescript
let currentCafeId = cafeId;

// If still no cafeId, try to get from AsyncStorage or create one
if (!currentCafeId) {
  currentCafeId = await AsyncStorage.getItem('cafeId');
  if (!currentCafeId) {
    currentCafeId = await createCafeIfNeeded();
  }
}
```

## Cách test

### 1. Kiểm tra AsyncStorage keys
```javascript
// Trong console
const allKeys = await AsyncStorage.getAllKeys();
console.log('All keys:', allKeys);

const cafeId = await AsyncStorage.getItem('cafeId');
const userId = await AsyncStorage.getItem('userId');
const userData = await AsyncStorage.getItem('user_data');

console.log('cafeId:', cafeId);
console.log('userId:', userId);
console.log('userData:', userData);
```

### 2. Test flow
1. Login với admin account
2. Kiểm tra log: "Đã lưu cafeId: ..."
3. Navigate to shop-info
4. Kiểm tra log: "ShopInfo - All AsyncStorage keys: ..."
5. Kiểm tra log: "ShopInfo - cafeId from AsyncStorage: ..."

### 3. Test retry mechanism
1. Nếu gặp error screen
2. Nhấn "Thử lại"
3. Kiểm tra có tạo cafe mới không

## Expected logs sau khi fix

```
LOG  Đã lưu cafeId: 6848f40cc953f7ca00c2e3a1
LOG  DEBUG: Login User Screen - Role admin
LOG  ShopInfo - All AsyncStorage keys: ["auth_token", "user_data", "userId", "cafeId"]
LOG  ShopInfo - cafeId from AsyncStorage: 6848f40cc953f7ca00c2e3a1
LOG  ShopInfo - Loaded cafe data: {...}
LOG  ShopInfo - cafeId when Next: 6848f40cc953f7ca00c2e3a1
```

## Nếu vẫn lỗi

### Kiểm tra thêm:
1. **API response**: Cafe có được tạo thành công không?
2. **AsyncStorage persistence**: Có bị clear khi restart app không?
3. **Navigation timing**: Có navigate quá nhanh không?
4. **User role**: User có đúng role admin không?

### Debug commands:
```javascript
// Clear all AsyncStorage (for testing)
await AsyncStorage.clear();

// Manual set cafeId (for testing)
await AsyncStorage.setItem('cafeId', '6848f40cc953f7ca00c2e3a1');

// Check specific keys
const keys = ['auth_token', 'user_data', 'userId', 'cafeId'];
for (const key of keys) {
  const value = await AsyncStorage.getItem(key);
  console.log(`${key}:`, value);
}
```
