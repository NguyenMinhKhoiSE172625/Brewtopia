# Test Plan: Cafe Creation với UserID

## Thay đổi đã thực hiện:

### 1. Cập nhật ApiService.ts
- **Thay đổi method `createCafe`**: Từ `adminId` thành `userId`
- **Cập nhật logic đăng nhập**: Tự động tạo cafe khi admin đăng nhập
- **Áp dụng cho tất cả phương thức đăng nhập**: Email/password, Google, Facebook

### 2. Logic mới:
```typescript
// Trước đây (trong login response):
{
  token: "...",
  user: {...},
  cafeId: "existing-cafe-id"  // Trả về từ backend
}

// Bây giờ (tự động tạo):
if (response.user.role === 'admin') {
  const cafeResponse = await this.cafe.createCafe(response.user.id);
  response.cafeId = cafeResponse.id;
}
```

### 3. API Call thay đổi:
```typescript
// Trước:
POST /cafes
{ adminId: "admin-user-id" }

// Bây giờ:
POST /cafes  
{ userId: "admin-user-id" }
```

## Test Cases cần kiểm tra:

### 1. Đăng nhập Admin lần đầu
- [ ] User admin đăng nhập thành công
- [ ] API `/cafes` được gọi với `userId`
- [ ] `cafeId` được lưu vào AsyncStorage
- [ ] Hiển thị message yêu cầu cập nhật thông tin
- [ ] Chuyển hướng đến business registration

### 2. Đăng nhập Admin đã có cafe
- [ ] User admin đăng nhập thành công
- [ ] API `/cafes` trả về lỗi (cafe đã tồn tại)
- [ ] Sử dụng `cafeId` từ response login (fallback)
- [ ] Không hiển thị message cập nhật nếu đã hoàn thành

### 3. Business Registration Flow
- [ ] Tất cả các bước sử dụng `cafeId` từ AsyncStorage
- [ ] Shop info, menu selection, tax info, identification
- [ ] API calls sử dụng đúng `cafeId`

### 4. Đăng nhập Google/Facebook Admin
- [ ] Cùng logic tạo cafe như email/password
- [ ] `cafeId` được lưu đúng cách

### 5. User thường (không phải admin)
- [ ] Không gọi API tạo cafe
- [ ] Đăng nhập bình thường

## Files đã thay đổi:
- `Brewtopia/app/utils/ApiService.ts`
- Xóa `Brewtopia/app/services/api.ts` (không sử dụng)

## Backend cần cập nhật:
- API `POST /cafes` nhận `userId` thay vì `adminId`
- Xử lý trường hợp cafe đã tồn tại cho user
