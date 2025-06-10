# Test Plan: News API Integration

## Thay đổi đã thực hiện:

### 1. Cập nhật ApiService.ts
- **Thêm Posts API methods**:
  - `getPosts(page, limit)` - Lấy danh sách posts với pagination
  - `createPost(content, images)` - Tạo post mới
  - `toggleLike(postId)` - Like/unlike post
  - `addComment(postId, content)` - Thêm comment
  - `getComments(postId)` - Lấy comments của post

### 2. Cập nhật News Component
- **Thay thế dữ liệu cứng bằng API calls**
- **Thêm state management**:
  - `posts` - Danh sách posts từ API
  - `loading` - Trạng thái loading
  - `refreshing` - Trạng thái refresh
  - `currentUser` - Thông tin user hiện tại
  - `page` - Trang hiện tại cho pagination
  - `hasMorePosts` - Còn posts để load không

- **Thêm functions**:
  - `convertApiPostToUIPost()` - Chuyển đổi format API sang UI
  - `formatTimestamp()` - Format thời gian hiển thị
  - `fetchPosts()` - Lấy posts từ API
  - `loadMorePosts()` - Load thêm posts (pagination)
  - `onRefresh()` - Refresh danh sách posts
  - `handleCreatePost()` - Tạo post mới qua API

### 3. Cập nhật Post Component
- **Hỗ trợ multiple images**:
  - Hiển thị nhiều ảnh trong một post
  - Image viewer với swipe navigation
  - Badge hiển thị số lượng ảnh
  - Indicator hiển thị ảnh hiện tại

### 4. UI Improvements
- **Loading indicators**:
  - Initial loading spinner
  - Pagination loading
  - Refresh control
- **End of posts message**
- **Error handling với Alert**

## API Endpoints được sử dụng:

### GET /posts
```
Query params:
- page: number (default: 1)
- limit: number (default: 10)

Response:
{
  "message": "Posts retrieved successfully",
  "posts": [...],
  "total": number,
  "page": number,
  "totalPages": number
}
```

### POST /posts
```
Body:
{
  "content": string,
  "images": string[] (optional)
}

Response:
{
  "message": "Post created successfully",
  "post": {...}
}
```

## Test Cases cần kiểm tra:

### 1. Load Posts
- [ ] Trang news load posts từ API thành công
- [ ] Hiển thị loading indicator khi load lần đầu
- [ ] Hiển thị posts với đúng format (tên, thời gian, nội dung, ảnh, likes)
- [ ] Xử lý trường hợp không có posts

### 2. Pagination
- [ ] Scroll xuống cuối tự động load thêm posts
- [ ] Hiển thị loading indicator khi load thêm
- [ ] Hiển thị "You've reached the end!" khi hết posts
- [ ] Không load duplicate posts

### 3. Refresh
- [ ] Pull to refresh hoạt động
- [ ] Reset về trang 1 khi refresh
- [ ] Hiển thị refresh indicator

### 4. Create Post
- [ ] Tạo post chỉ với text
- [ ] Tạo post với text + ảnh
- [ ] Tạo post với rating
- [ ] Hiển thị tên user hiện tại trong modal
- [ ] Reset form sau khi tạo thành công
- [ ] Refresh danh sách sau khi tạo

### 5. Multiple Images
- [ ] Hiển thị badge "+X" khi có nhiều ảnh
- [ ] Tap vào ảnh mở image viewer
- [ ] Swipe qua lại giữa các ảnh trong viewer
- [ ] Hiển thị indicator "X / Y" trong viewer

### 6. Error Handling
- [ ] Hiển thị alert khi API call thất bại
- [ ] Xử lý trường hợp network error
- [ ] Xử lý trường hợp user chưa login

## Files đã thay đổi:
- `Brewtopia/app/utils/ApiService.ts` - Thêm Posts API
- `Brewtopia/app/pages/news/news.tsx` - Thay thế logic cứng bằng API
- `Brewtopia/app/components/Post.tsx` - Hỗ trợ multiple images

## Backend Requirements:
- API `GET /posts` với pagination
- API `POST /posts` để tạo post mới
- Trả về đúng format như trong example
- Hỗ trợ authentication với Bearer token
