# Sửa lỗi Address API và thêm Map Location Picker

## Tóm tắt vấn đề đã giải quyết

### 1. **Vấn đề cấu trúc Address không nhất quán**
- **Trước**: API trả về address dạng string cho cafe đã cập nhật, object cho cafe mới
- **Sau**: Thống nhất sử dụng address object với coordinates

### 2. **Thiếu tính năng chọn vị trí trên bản đồ**
- **Trước**: Chỉ có thể nhập địa chỉ text
- **Sau**: Có thể chọn vị trí trên bản đồ và lấy coordinates chính xác

## Files đã thay đổi

### 1. `app/utils/ApiService.ts`
```typescript
// Cập nhật interface hỗ trợ cả string và object
address?: string | {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  coordinates?: [number, number];
};
```

### 2. `app/components/MapLocationPicker.tsx` (MỚI)
- Component chọn vị trí trên bản đồ
- Hỗ trợ drag marker
- Reverse geocoding
- Hiển thị địa chỉ được chọn

### 3. `app/pages/business-registration/shop-info.tsx`
- Thêm button "Chọn vị trí trên bản đồ"
- Hiển thị coordinates đã chọn
- Gửi address dưới dạng object với coordinates
- Xử lý cả address string và object từ API

### 4. `app/utils/addressUtils.ts` (MỚI)
- Utility functions để xử lý address
- `formatAddressToString()`: Convert object → string
- `createAddressObject()`: Tạo address object
- `hasValidCoordinates()`: Kiểm tra coordinates hợp lệ

## Cách sử dụng

### 1. Trong shop-info.tsx:
1. Nhập thông tin cơ bản (tên quán, email, phone)
2. Chọn địa chỉ bằng picker tỉnh/thành
3. **MỚI**: Nhấn "Chọn vị trí trên bản đồ" để chọn coordinates chính xác
4. Nhấn Next để lưu

### 2. Map Location Picker:
1. Mở bản đồ với vị trí hiện tại
2. Tap vào bản đồ hoặc kéo marker để chọn vị trí
3. Xem địa chỉ được reverse geocode
4. Nhấn "Xác nhận" để lưu

## Cấu trúc dữ liệu mới

### Request gửi lên API:
```json
{
  "name": "Tên quán cafe",
  "address": {
    "street": "123 Đường ABC",
    "ward": "Phường XYZ",
    "district": "Quận 1", 
    "city": "TP.HCM",
    "coordinates": [10.7769, 106.7009]
  },
  "email": "email@example.com",
  "phoneNumber": "0123456789"
}
```

### Response từ API (mong đợi):
```json
{
  "address": {
    "street": "123 Đường ABC",
    "ward": "Phường XYZ",
    "district": "Quận 1",
    "city": "TP.HCM", 
    "coordinates": [10.7769, 106.7009]
  }
}
```

## Backward Compatibility

Code vẫn xử lý được:
- Address dạng string từ API cũ
- Address dạng object từ API mới
- Tự động convert khi cần thiết

## Dependencies đã có sẵn

- `react-native-maps`: Hiển thị bản đồ
- `expo-location`: Lấy vị trí và reverse geocoding
- `@expo/vector-icons`: Icons

## Test

1. **Test address object**:
   - Tạo cafe mới → kiểm tra address format
   - Cập nhật thông tin → kiểm tra coordinates được lưu

2. **Test map picker**:
   - Mở map picker
   - Chọn vị trí khác
   - Kiểm tra coordinates hiển thị đúng

3. **Test backward compatibility**:
   - Load cafe có address dạng string
   - Kiểm tra hiển thị đúng
   - Cập nhật và kiểm tra format mới

## Lưu ý

- Coordinates mặc định [0, 0] nếu không chọn
- Map picker yêu cầu quyền location
- Reverse geocoding có thể chậm với mạng yếu
- UI responsive với các kích thước màn hình khác nhau
