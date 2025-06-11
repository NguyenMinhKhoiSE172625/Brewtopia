# Test Address API Implementation

## Vấn đề đã được giải quyết:

### 1. Cấu trúc Address không nhất quán
**Trước khi sửa:**
- Cafe mới: address là object với coordinates
- Cafe đã cập nhật: address là string

**Sau khi sửa:**
- ApiService.ts đã được cập nhật để hỗ trợ cả string và object
- Thêm utility functions trong addressUtils.ts để xử lý address
- shop-info.tsx đã được cập nhật để gửi address dưới dạng object với coordinates

### 2. Thiếu tính năng chọn vị trí trên bản đồ
**Đã thêm:**
- Component MapLocationPicker.tsx
- Tích hợp vào shop-info.tsx
- Button "Chọn vị trí trên bản đồ"
- Hiển thị coordinates đã chọn

## Cách test:

### 1. Test cập nhật profile với address object:
```javascript
// Trong shop-info.tsx, khi nhấn Next, sẽ gửi:
{
  name: "Tên quán",
  address: {
    street: "123 Đường ABC",
    ward: "Phường XYZ", 
    district: "Quận 1",
    city: "TP.HCM",
    coordinates: [10.7769, 106.7009]
  },
  email: "email@example.com",
  phoneNumber: "0123456789"
}
```

### 2. Test MapLocationPicker:
1. Mở shop-info.tsx
2. Nhấn button "Chọn vị trí trên bản đồ"
3. Chọn vị trí trên bản đồ
4. Xác nhận
5. Kiểm tra coordinates được hiển thị

### 3. Test API response handling:
- API trả về address dạng string: được xử lý bởi formatAddressToString()
- API trả về address dạng object: được xử lý và extract coordinates

## Files đã thay đổi:

1. **app/utils/ApiService.ts**
   - Cập nhật interface cho updateProfile và getProfile
   - Hỗ trợ address dạng object với coordinates

2. **app/components/MapLocationPicker.tsx** (mới)
   - Component chọn vị trí trên bản đồ
   - Hỗ trợ drag marker
   - Reverse geocoding để hiển thị địa chỉ

3. **app/pages/business-registration/shop-info.tsx**
   - Thêm state cho coordinates và map modal
   - Thêm button chọn vị trí trên bản đồ
   - Cập nhật handleNext để gửi address object
   - Sử dụng utility functions

4. **app/utils/addressUtils.ts** (mới)
   - Utility functions để xử lý address
   - formatAddressToString, createAddressObject, etc.

## Kết quả mong đợi:

1. **API Response nhất quán:**
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

2. **UI cải thiện:**
   - Button chọn vị trí trên bản đồ
   - Hiển thị coordinates đã chọn
   - Map picker với marker có thể kéo thả

3. **Backward compatibility:**
   - Vẫn xử lý được address dạng string từ API cũ
   - Tự động convert sang format mới khi cập nhật
