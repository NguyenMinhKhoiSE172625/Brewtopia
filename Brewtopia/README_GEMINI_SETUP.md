# 🔧 Hướng dẫn khắc phục lỗi Gemini AI Timeout

## ❌ Vấn đề hiện tại:
- Gemini AI bị timeout "Request timeout - vui lòng thử lại"
- API key cũ không còn hoạt động
- Thiếu file .env để cấu hình

## ✅ Cách khắc phục:

### Bước 1: Tạo API Key Gemini mới (MIỄN PHÍ)

1. **Truy cập Google AI Studio:**
   - Vào: https://aistudio.google.com/apikey
   - Đăng nhập bằng tài khoản Google

2. **Tạo API Key:**
   - Click "Create API key"
   - Chọn "Create API key in new project"
   - Copy API key được tạo

3. **Lưu ý bảo mật:**
   - Không share API key với ai
   - Không commit vào Git
   - Chỉ sử dụng cho development

### Bước 2: Cấu hình file .env

1. **Mở file `.env` trong thư mục gốc dự án**

2. **Thay thế `YOUR_NEW_GEMINI_API_KEY`:**
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```

3. **Ví dụ:**
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
   ```

### Bước 3: Restart ứng dụng

```bash
# Dừng Metro bundler (Ctrl+C)
# Xóa cache và restart
npx expo start --clear
```

### Bước 4: Test Gemini AI

1. Mở app trên device/emulator
2. Vào phần Chat → BREWBOT
3. Gửi tin nhắn: "Xin chào"
4. Kiểm tra phản hồi từ AI

## 🔍 Kiểm tra API Key có hoạt động:

Mở Terminal và chạy lệnh test:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Xin chào"}]
    }]
  }'
```

**Kết quả mong đợi:**
- Status code: 200
- Response có nội dung JSON với "candidates"

**Nếu lỗi:**
- 403: API key không hợp lệ
- 429: Vượt quá quota
- 400: Định dạng request sai

## 📋 Checklist hoàn thành:

- [ ] Tạo API key mới từ Google AI Studio
- [ ] Thay thế key trong file .env
- [ ] Restart Expo app (npx expo start --clear)
- [ ] Test chat với BREWBOT
- [ ] AI phản hồi thành công

## 🚨 Lưu ý quan trọng:

1. **Giới hạn miễn phí:**
   - 15 requests/phút
   - 1M tokens/phút
   - 1,500 requests/ngày

2. **Bảo mật:**
   - Thêm `.env` vào `.gitignore`
   - Không commit API key vào Git
   - Tạo key riêng cho từng environment

3. **Monitoring:**
   - Theo dõi usage tại: https://aistudio.google.com/
   - Set up alerts khi gần hết quota

## 📞 Hỗ trợ:

Nếu vẫn gặp lỗi sau khi làm theo hướng dẫn:
1. Kiểm tra console logs trong Metro bundler
2. Verify API key trên Google AI Studio
3. Đảm bảo network connection ổn định
4. Check firewall/proxy settings 