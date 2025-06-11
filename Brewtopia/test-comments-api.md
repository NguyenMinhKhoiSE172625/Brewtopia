# Test Plan: Comments API Integration

## Thay đổi đã thực hiện:

### 1. Cập nhật ApiService.ts
- **Thêm Comments API methods**:
  - `getComments(targetId, targetType)` - Lấy comments với POST request
  - `addComment(targetId, content, targetType)` - Tạo comment mới
  - `getCommentsWithQuery(targetId, targetType)` - Alternative method với query params

- **Get Comments Body**:
    ```json
    {
      "targetId": "684928f3875adf15b751431d",
      "targetType": "Post"
    }
    ```

- **Create Comment Body**:
    ```json
    {
      "targetId": "684928f3875adf15b751431d",
      "targetType": "Post",
      "content": "Quán này ngon quá!"
    }
    ```

### 2. Cập nhật Post Component
- **Thêm state management**:
  - `loadingComments` - Trạng thái loading comments
  - `commentsLoaded` - Đã load comments chưa
  
- **Thêm functions**:
  - `convertApiCommentToUIComment()` - Chuyển đổi format API sang UI
  - `formatTimestamp()` - Format thời gian hiển thị
  - `fetchComments()` - Lấy comments từ API khi click
  - `handleToggleComments()` - Toggle comments và fetch nếu chưa load
  - `handleAddComment()` - Thêm comment qua API
  - `handleLike()` - Like/unlike qua API

- **UI Improvements**:
  - Loading indicator khi fetch comments
  - Error handling với Alert
  - Optimistic UI updates cho comments

### 3. API Endpoints được sử dụng:

#### POST /comments/allComments (Get Comments)
```
Method: POST
Body:
{
  "targetId": "684928f3875adf15b751431d",
  "targetType": "Post"
}

Response: (Array trực tiếp)
[
  {
    "_id": "68492a1a0ce1aac501d946f1",
    "content": "Quán này ngon quá!",
    "createdAt": "2025-06-11T07:02:50.438Z",
    "likes": [],
    "targetId": "684928f3875adf15b751431d",
    "targetType": "Post",
    "updatedAt": "2025-06-11T07:02:50.438Z",
    "user": "68492539e8636238090f19ed"
  }
]
```

#### POST /comments (Create Comment)
```
Method: POST
Body:
{
  "targetId": "684928f3875adf15b751431d",
  "targetType": "Post",
  "content": "Quán này ngon quá!"
}

Response: (Comment object)
{
  "_id": "68492a1a0ce1aac501d946f1",
  "content": "Quán này ngon quá!",
  "createdAt": "2025-06-11T07:02:50.438Z",
  "likes": [],
  "targetId": "684928f3875adf15b751431d",
  "targetType": "Post",
  "updatedAt": "2025-06-11T07:02:50.438Z",
  "user": "68492539e8636238090f19ed"
}
```

## Cách hoạt động:

1. **Khi user click vào comments button**:
   - Component sẽ toggle `showComments`
   - Nếu chưa load comments (`!commentsLoaded`), sẽ gọi `fetchComments()`
   - Hiển thị loading indicator trong khi fetch

2. **Khi user thêm comment**:
   - Gọi API `addComment(targetId, content, targetType)` với endpoint `/comments`
   - Nhận response là comment object mới được tạo
   - Convert API response sang UI format và thêm vào local state
   - Nếu API fail, hiển thị error alert

3. **Khi user like/unlike**:
   - Gọi API `toggleLike()`
   - Update UI ngay lập tức
   - Nếu API fail, hiển thị error alert

## Files đã thay đổi:
- `Brewtopia/app/utils/ApiService.ts` - Thêm Comments API methods
- `Brewtopia/app/components/Post.tsx` - Tích hợp API calls và loading states

## Backend Requirements:
- API `POST /comments/allComments` với body request như đã chỉ định
- Trả về array trực tiếp (không wrap trong object)
- User field trả về user ID (string) thay vì user object
- Hỗ trợ authentication với Bearer token

## Lỗi đã sửa:
1. **Body not allowed for GET requests**: Đã chuyển từ GET sang POST method
2. **Cannot read property 'map' of undefined**: API trả về array trực tiếp thay vì object có property comments
3. **User format**: API trả về user ID thay vì user object, đã cập nhật để hiển thị User + 4 ký tự cuối của ID
4. **apiComment.user.slice is not a function**: User field có thể undefined, đã thêm null check và fallback "Unknown User"

## Testing:
1. Test fetch comments khi click vào comments button
2. Test add comment functionality
3. Test like/unlike functionality
4. Test error handling khi API fails
5. Test loading states

## Notes:
- Đã implement cả 2 methods: `getComments` (GET với body) và `getCommentsWithQuery` (GET với query params)
- Nếu backend không support GET với body, có thể switch sang `getCommentsWithQuery`
- Comments được cache sau lần fetch đầu tiên để tránh fetch lại không cần thiết
