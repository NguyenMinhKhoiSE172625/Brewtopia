# Fix AsyncStorage Error: Passing undefined as value

## 🚨 Lỗi gốc:
```
ERROR  Login error: [Error: [AsyncStorage] Passing null/undefined as value is not supported. 
If you want to remove value, Use .removeItem method instead.
Passed value: undefined
Passed key: userId
```

## 🔍 Nguyên nhân:
- `response.user.id` có thể là `undefined`
- AsyncStorage không chấp nhận giá trị `null` hoặc `undefined`
- Cần kiểm tra giá trị trước khi lưu

## ✅ Giải pháp đã implement:

### 1. **Kiểm tra giá trị trước khi lưu**
```typescript
// TRƯỚC (lỗi):
await AsyncStorage.setItem('userId', response.user.id); // có thể undefined

// SAU (đã sửa):
const userId = response.user?.id || response.user?._id;
if (userId) {
  await AsyncStorage.setItem('userId', userId);
} else {
  console.log('No userId found in response.user:', response.user);
}
```

### 2. **Hỗ trợ cả `id` và `_id`**
Một số API trả về `_id` thay vì `id`, nên cần fallback:
```typescript
const userId = response.user?.id || response.user?._id;
```

### 3. **Thêm debug logging**
```typescript
console.log('ApiService - Login response user:', response.user);
console.log('ApiService - Saving userId:', userId);
```

### 4. **Cập nhật tất cả login methods**
- Regular login
- Google login  
- Facebook login

### 5. **Cập nhật shop-info.tsx**
```typescript
// Handle both id and _id when parsing user_data
userId = userData.id || userData._id;
```

## 📁 Files đã sửa:

### 1. `app/utils/ApiService.ts`
- `login()` method
- `loginWithGoogle()` method  
- `loginWithFacebook()` method
- Thêm null checks cho userId
- Thêm debug logging

### 2. `app/pages/business-registration/shop-info.tsx`
- `createCafeIfNeeded()` function
- Handle cả `id` và `_id` từ user_data

## 🧪 Test cases:

### 1. **Test với user có id**
```json
{
  "user": {
    "id": "6848f40cc953f7ca00c2e39f",
    "name": "Test User",
    "role": "admin"
  }
}
```
Expected: userId được lưu thành công

### 2. **Test với user có _id**
```json
{
  "user": {
    "_id": "6848f40cc953f7ca00c2e39f", 
    "name": "Test User",
    "role": "admin"
  }
}
```
Expected: userId được lưu thành công

### 3. **Test với user không có id**
```json
{
  "user": {
    "name": "Test User",
    "role": "admin"
  }
}
```
Expected: Log warning, không crash

## 📋 Expected logs sau khi fix:

### Thành công:
```
LOG  ApiService - Login response user: {id: "6848f40cc953f7ca00c2e39f", ...}
LOG  ApiService - Saving userId: 6848f40cc953f7ca00c2e39f
LOG  ApiService - Created and saved cafeId: 6848f40cc953f7ca00c2e3a1
```

### Không có userId:
```
LOG  ApiService - Login response user: {name: "Test", role: "admin"}
LOG  ApiService - No userId found in response.user: {name: "Test", role: "admin"}
LOG  ApiService - No userId available for cafe creation
```

## 🔄 Fallback mechanisms:

1. **Primary**: Lấy từ `response.user.id`
2. **Fallback 1**: Lấy từ `response.user._id`  
3. **Fallback 2**: Parse từ `user_data` trong AsyncStorage
4. **Fallback 3**: Log warning và skip

## ⚠️ Lưu ý:

- Luôn kiểm tra giá trị trước khi lưu vào AsyncStorage
- Hỗ trợ cả `id` và `_id` để tương thích với các API khác nhau
- Thêm logging để debug dễ dàng
- Không crash app khi thiếu userId

## 🎯 Kết quả:

- ✅ Không còn lỗi AsyncStorage undefined
- ✅ Hỗ trợ nhiều format userId
- ✅ Debug logging chi tiết
- ✅ Graceful handling khi thiếu data
- ✅ Backward compatibility
