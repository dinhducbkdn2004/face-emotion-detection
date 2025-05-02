# API Documentation for Emotion Detection Service

## Tổng quan

API Emotion Detection cung cấp các endpoint để:

- Xác thực người dùng thông qua Firebase Authentication
- Phát hiện cảm xúc từ hình ảnh khuôn mặt
- Quản lý lịch sử phát hiện cảm xúc

> Base URL: `https://ped.ldblckrs.id.vn` 

## Xác thực (Authentication)

API hỗ trợ 2 phương thức xác thực:

1. **Xác thực qua Firebase Client SDK**: Client sử dụng Firebase SDK để xác thực, sau đó gửi ID token đến backend
2. **Sử dụng dưới dạng khách (Guest)**: Hệ thống sẽ tự động tạo và sử dụng cookie để theo dõi số lần sử dụng của người dùng khách, giới hạn 5 lần sử dụng tính năng nhận diện cảm xúc

### Endpoint xác thực

#### 1. Xác thực Firebase ID Token

**Request:**

```http
POST /auth/verify-token
Content-Type: application/json

{
  "id_token": "firebase_id_token"
}
```

**Response:**

```json
{
    "message": "Token verified",
    "user": {
        "user_id": "firebase_user_id",
        "email": "user@example.com",
        "display_name": "John Doe",
        "photo_url": "https://example.com/photo.jpg",
        "is_guest": false,
        "is_email_verified": true,
        "providers": ["password", "google.com"],
        "usage_count": 5,
        "last_used": "2023-06-01T10:00:00",
        "created_at": "2023-01-01T09:00:00"
    },
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "token_type": "bearer"
}
```

**Lỗi có thể gặp:**

- `401 Unauthorized`: Token không hợp lệ

#### 2. Sử dụng chế độ khách (Guest)

Đối với chế độ khách, không cần gọi endpoint cụ thể. Hệ thống sẽ tự động tạo và quản lý cookie khi người dùng truy cập các API mà không có token xác thực. Guest users được giới hạn 5 lần sử dụng tính năng nhận diện cảm xúc trong 1 giờ.

**Lưu ý:** API sử dụng cookie HTTP-only có tên `guest_usage_info` để theo dõi thông tin người dùng khách, bao gồm ID và số lần sử dụng. Cookie này có thời hạn 30 ngày..

#### 3. Lấy thông tin profile

**Request:**

```http
GET /auth/profile
Authorization: Bearer {access_token}
```

**Response:**

```json
{
    "user_id": "firebase_user_id",
    "email": "user@example.com",
    "display_name": "John Doe",
    "photo_url": "https://example.com/photo.jpg",
    "is_guest": false,
    "is_email_verified": true,
    "providers": ["password", "google.com"],
    "usage_count": 5,
    "last_used": "2023-06-01T10:00:00",
    "created_at": "2023-01-01T09:00:00"
}
```

#### 4. Lấy thông tin sử dụng

**Request:**

```http
GET /auth/usage
Authorization: Bearer {access_token}
```

**Response:**

```json
{
    "user_id": "firebase_user_id",
    "is_guest": false,
    "usage_count": 5,
    "max_usage": null
}
```

Đối với guest user, `max_usage` sẽ là 5.

## API Phát hiện cảm xúc (Emotion Detection)

### Endpoints

#### 1. Phát hiện cảm xúc từ hình ảnh

**Request:**

```http
POST /api/detect
Authorization: Bearer {access_token} (nếu có)
Content-Type: multipart/form-data

file: [binary image data]
```

**Response:**

```json
{
  "detection_id": "unique_detection_id (UUID)",
  "user_id": "user_id",
  "timestamp": "2023-06-01T10:05:00",
  "image_url": "https://cloudinary.com/path/to/image.jpg" (có thể null với guest),
  "detection_results": {
    "faces": [
      {
        "box": [x, y, width, height],
        "emotions": [
          { "emotion": "happy", "score": 0.92, "percentage": 92.0 },
          { "emotion": "sad", "score": 0.05, "percentage": 5.0 },
          { "emotion": "angry", "score": 0.03, "percentage": 3.0 }
        ]
      }
      // ...có thể có nhiều khuôn mặt
    ],
    "face_detected": true,
    "processing_time": 0.235
  }
}
```

**Giải thích các trường:**

- `faces`: Danh sách các khuôn mặt được phát hiện trên ảnh.
    - `box`: Mảng 4 số nguyên `[x, y, width, height]` là tọa độ góc trên trái và kích thước khuôn mặt (đơn vị pixel trên ảnh gốc).
    - `emotions`: Danh sách các cảm xúc dự đoán cho khuôn mặt đó.
        - `emotion`: Tên cảm xúc (happy, sad, angry, ...)
        - `score`: Xác suất (0-1)
        - `percentage`: Tỷ lệ phần trăm (0-100)
- `face_detected`: Có phát hiện khuôn mặt hay không (true/false)
- `processing_time`: Thời gian xử lý (giây)

**Lỗi có thể gặp:**

- `400 Bad Request`: Không upload file hoặc file không phải là hình ảnh
- `400 Bad Request`: Kích thước file quá lớn (giới hạn 5MB)
- `400 Bad Request`: Định dạng file không được hỗ trợ
- `403 Forbidden`: Guest user đã vượt quá giới hạn sử dụng (5 lần)
- `429 Too Many Requests`: Quá giới hạn tốc độ (rate limit)
- `500 Internal Server Error`: Lỗi xử lý hình ảnh hoặc phát hiện cảm xúc

#### 2. Phát hiện cảm xúc batch (nhiều ảnh)

**Request:**

```http
POST /api/detect/batch
Authorization: Bearer {access_token} (nếu có)
Content-Type: multipart/form-data

files: [nhiều file ảnh]
```

**Response:**

Streaming (SSE): mỗi kết quả trả về dạng JSON như ở endpoint /api/detect, gửi từng phần:

```
data: { ...detection_result... }\n\n
```

Nếu lỗi:

```
data: { "error": "Lỗi chi tiết", "filename": "tên file" }\n\n
```

**Lỗi có thể gặp:**

- `400 Bad Request`: Không upload file hoặc file không phải là hình ảnh
- `429 Too Many Requests`: Quá giới hạn tốc độ (rate limit)
- `500 Internal Server Error`: Lỗi xử lý hình ảnh hoặc phát hiện cảm xúc

#### 3. Kiểm tra trạng thái xử lý detection

**Request:**

```http
GET /api/detect/status/{detection_id}
```

**Response:**

```json
{
    "detection_id": "unique_detection_id",
    "status": "pending | done | failed"
}
```

**Lỗi có thể gặp:**

- `404 Not Found`: detection_id không tồn tại

#### 4. Lấy lịch sử phát hiện cảm xúc

**Request:**

```http
GET /api/history?skip=0&limit=10
Authorization: Bearer {access_token}
```

Query parameters:

- `skip`: Số bản ghi bỏ qua (dùng cho phân trang, mặc định là 0)
- `limit`: Số bản ghi tối đa trả về (mặc định là 10)

**Response:**

```json
[
  {
    "detection_id": "unique_detection_id_1",
    "user_id": "user_id",
    "timestamp": "2023-06-01T10:05:00",
    "image_url": "https://cloudinary.com/path/to/image1.jpg",
    "detection_results": {
      "faces": [ ... ],
      "face_detected": true,
      "processing_time": 0.235
    }
  },
  {
    "detection_id": "unique_detection_id_2",
    "user_id": "user_id",
    "timestamp": "2023-06-01T09:30:00",
    "image_url": "https://cloudinary.com/path/to/image2.jpg",
    "detection_results": {
      "faces": [ ... ],
      "face_detected": true,
      "processing_time": 0.212
    }
  }
]
```

#### 5. Lấy chi tiết một lần phát hiện cảm xúc

**Request:**

```http
GET /api/history/{detection_id}
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "detection_id": "unique_detection_id",
  "user_id": "user_id",
  "timestamp": "2023-06-01T10:05:00",
  "image_url": "https://cloudinary.com/path/to/image.jpg",
  "detection_results": {
    "faces": [ ... ],
    "face_detected": true,
    "processing_time": 0.235
  }
}
```

**Lỗi có thể gặp:**

- `404 Not Found`: Detection ID không tồn tại
- `403 Forbidden`: Detection không thuộc về người dùng hiện tại

#### 6. Xóa một lần phát hiện cảm xúc

**Request:**

```http
DELETE /api/history/{detection_id}
Authorization: Bearer {access_token}
```

**Response:**

```
Status: 204 No Content
```

**Lỗi có thể gặp:**

- `404 Not Found`: Detection ID không tồn tại
- `403 Forbidden`: Detection không thuộc về người dùng hiện tại
- `500 Internal Server Error`: Lỗi khi xóa detection

## Endpoint bổ sung

### Refresh token

**Request:**

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "jwt_refresh_token"
}
```

**Response:**

```json
{
    "access_token": "jwt_access_token",
    "token_type": "bearer"
}
```

**Lỗi có thể gặp:**

- `401 Unauthorized`: Refresh token không hợp lệ

### Health check & Metrics

- `GET /healthz`: Health check đơn giản
- `GET /readyz`: Kiểm tra tình trạng MongoDB & Firebase
- `GET /metrics`: Prometheus metrics endpoint
