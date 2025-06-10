# Demo: Multiple Images Layout

## Các layout ảnh mới đã được implement:

### 1. **Single Image (1 ảnh)**
```
┌─────────────────────┐
│                     │
│     Single Image    │
│                     │
└─────────────────────┘
```
- Hiển thị full width
- Tap để mở image viewer

### 2. **Two Images (2 ảnh)**
```
┌─────────┬─────────┐
│         │         │
│ Image 1 │ Image 2 │
│         │         │
└─────────┴─────────┘
```
- Chia đôi màn hình
- Mỗi ảnh có thể tap riêng biệt

### 3. **Three Images (3 ảnh)**
```
┌─────────┬─────┐
│         │ Img │
│ Image 1 │  2  │
│         ├─────┤
│         │ Img │
└─────────┤  3  │
          └─────┘
```
- Ảnh đầu chiếm 2/3 bên trái
- 2 ảnh còn lại chia đôi bên phải

### 4. **Four or More Images (4+ ảnh)**
```
┌─────────┬─────────┐
│ Image 1 │ Image 2 │
├─────────┼─────────┤
│ Image 3 │ Image 4 │
│         │   +X    │
└─────────┴─────────┘
```
- Layout 2x2 grid
- Ảnh thứ 4 có overlay "+X" nếu còn nhiều ảnh

## Image Viewer Modal Improvements:

### 1. **Header với controls**
- Nút đóng (X) ở góc trái
- Counter "X / Y" ở góc phải
- Background mờ để dễ nhìn

### 2. **Navigation**
- Swipe trái/phải để chuyển ảnh
- Dots indicator ở dưới cùng
- Dot active sáng hơn và to hơn

### 3. **Không tự đóng khi tap ảnh**
- Chỉ đóng khi tap nút X
- Hoặc tap vào vùng trống (edges)
- Ảnh không bị đóng khi tap

### 4. **Visual Indicators**
- Counter hiển thị ảnh hiện tại
- Dots cho navigation
- Smooth transitions

## Code Structure:

### Post.tsx Changes:
```typescript
// Detect image array vs single image
const isMultipleImages = Array.isArray(imageUrl);
const images = isMultipleImages ? imageUrl : [imageUrl];

// Different layouts based on count
if (images.length === 1) { /* Single */ }
else if (images.length === 2) { /* Side by side */ }
else if (images.length === 3) { /* Large + 2 small */ }
else { /* 2x2 grid with overlay */ }
```

### Modal Structure:
```typescript
<Modal>
  <Header>
    <CloseButton />
    <Counter />
  </Header>
  
  <FlatList horizontal pagingEnabled>
    {images.map(image => <ImageSlide />)}
  </FlatList>
  
  <DotsIndicator />
  <CloseArea />
</Modal>
```

## User Experience:

### 1. **Clear Visual Hierarchy**
- Dễ nhận biết post có bao nhiêu ảnh
- Layout tối ưu cho từng số lượng ảnh
- Không bị lãng phí không gian

### 2. **Intuitive Navigation**
- Tap vào ảnh bất kỳ để mở viewer
- Swipe để xem ảnh tiếp theo
- Visual feedback rõ ràng

### 3. **No Accidental Closing**
- Modal không đóng khi tap ảnh
- Chỉ đóng khi user có ý định
- Dễ dàng browse qua nhiều ảnh

## Test Cases:

### Layout Tests:
- [ ] 1 ảnh: Hiển thị full width
- [ ] 2 ảnh: Side by side layout
- [ ] 3 ảnh: Large + 2 small layout  
- [ ] 4+ ảnh: 2x2 grid với "+X" overlay

### Modal Tests:
- [ ] Tap ảnh mở modal với ảnh đúng
- [ ] Swipe chuyển ảnh smooth
- [ ] Counter cập nhật đúng
- [ ] Dots indicator hoạt động
- [ ] Tap ảnh KHÔNG đóng modal
- [ ] Tap nút X đóng modal
- [ ] Tap vùng trống đóng modal

### API Integration:
- [ ] API trả về array ảnh được hiển thị đúng
- [ ] Single image từ API hoạt động
- [ ] Multiple images từ API hoạt động
- [ ] No images fallback to avatar

## Files Modified:
- `Brewtopia/app/components/Post.tsx` - Multiple images layout + modal
- `Brewtopia/app/pages/news/news.tsx` - API integration update
