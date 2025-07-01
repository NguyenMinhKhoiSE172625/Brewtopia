# PayOS Payment Setup Guide

## Đã sửa lỗi "returnUrl, cancelUrl must not be undefined or null"

### Các thay đổi đã thực hiện:

1. **Cập nhật ApiService.ts** (`app/utils/ApiService.ts`):
   - Thêm `returnUrl: 'brewtopia://payment-success'` và `cancelUrl: 'brewtopia://payment-cancel'` vào request body
   - Đảm bảo API call có đủ các tham số bắt buộc

2. **Cập nhật app.json**:
   - Thay đổi scheme từ "myapp" thành "brewtopia" để phù hợp với deep link URL

3. **Cập nhật payment.tsx** (`app/pages/payment/payment.tsx`):
   - Thêm xử lý deep link `brewtopia://payment-success` và `brewtopia://payment-cancel`
   - Thêm console.log để debug navigation state

4. **Cập nhật app.tsx**:
   - Thêm xử lý deep link khi app được mở từ deep link
   - Xử lý navigation cho payment success và cancel

### Cách test:

1. **Test trong app**:
   - Vào trang Premium (`/pages/premium/premium`)
   - Nhấn "Subscribe Now"
   - Kiểm tra console log để xem API call có thành công không

2. **Test API trực tiếp**:
   - Sử dụng file `test-payment.js`
   - Thay `YOUR_API_DOMAIN` và `YOUR_TOKEN` bằng giá trị thực tế
   - Chạy: `node test-payment.js`

### Flow hoạt động:

1. User nhấn thanh toán → Gọi `ApiService.payment.createPayosPayment()`
2. API trả về `checkoutUrl` → Mở WebView với URL này
3. User thanh toán xong → PayOS redirect về `brewtopia://payment-success` hoặc `brewtopia://payment-cancel`
4. App xử lý deep link → Chuyển đến trang success hoặc quay lại

### Lưu ý:

- Đảm bảo backend API `/payments/createPayos` chấp nhận các tham số: `targetModel`, `amount`, `description`, `returnUrl`, `cancelUrl`
- Deep link scheme "brewtopia" phải được đăng ký trong app
- Test trên device thật vì deep link có thể không hoạt động trên simulator

### Debug:

- Kiểm tra console log trong payment.tsx để xem navigation state
- Kiểm tra network tab để xem API call có thành công không
- Đảm bảo token authentication còn hiệu lực 