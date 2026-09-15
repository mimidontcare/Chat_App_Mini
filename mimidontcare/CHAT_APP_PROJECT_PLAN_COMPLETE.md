# PROJECT PLAN: ỨNG DỤNG CHAT MOBILE 1-1
**Mục tiêu:** Xây dựng ứng dụng chat mobile 1-1 realtime ở mức độ đồ án sinh viên.
**Stack công nghệ:** React Native (Frontend), Node.js + Express (Backend), MySQL (Database), Socket.IO (Realtime).

---

## I. THÔNG TIN & CÔNG NGHỆ BẮT BUỘC
- **Frontend:** React Native, JavaScript.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL.
- **Realtime:** Socket.IO.
- **Authentication:** JWT, bcryptjs.
- **Image Storage:** Cloudinary.

## II. DANH SÁCH CHỨC NĂNG BẮT BUỘC & PHÂN LOẠI ƯU TIÊN
### 1. MUST HAVE (Bắt buộc phải có để chạy được luồng chính)
- Đăng ký, Đăng nhập (Authentication bằng JWT).
- Hồ sơ cá nhân (Profile cơ bản).
- Tìm kiếm người dùng (Search User).
- Gửi / Nhận / Chấp nhận lời mời kết bạn (Friend Request).
- Chat 1-1 cơ bản.
- Gửi tin nhắn Text.
- Nhắn tin Realtime bằng Socket.IO.
- Tin nhắn từ người lạ (Message Requests).

### 2. SHOULD HAVE (Nên có để hoàn thiện trải nghiệm)
- Gửi ảnh (Upload qua Cloudinary).
- Trạng thái Online / Offline.
- Hiển thị đã đọc tin nhắn (Read message).
- Hiển thị đang gõ chữ (Typing indicator).
- Thông báo in-app (Notification).

### 3. OPTIONAL (Chỉ làm khi còn dư thời gian)
- Voice Call / Video Call (WebRTC).
- Push Notification (Firebase).
- Thả Emoji, Reply tin nhắn, Thu hồi tin nhắn.

---

## III. THIẾT KẾ DATABASE (MYSQL ERD)
Cơ sở dữ liệu đảm bảo **User A và User B chỉ có MỘT conversation 1-1** bằng cách luôn lưu `user1_id` < `user2_id` và thiết lập Unique Constraint.

1. **users**
   - `id` (PK), `username` (Unique), `email` (Unique), `password_hash`, `avatar_url`, `created_at`.
2. **friend_requests**
   - `id` (PK), `sender_id` (FK), `receiver_id` (FK), `status` (pending/accepted/rejected), `created_at`. 
   - *Unique Constraint:* (sender_id, receiver_id).
3. **friendships**
   - `id` (PK), `user1_id` (FK), `user2_id` (FK), `created_at`. 
   - *Ràng buộc:* Luôn lưu user1_id < user2_id.
4. **conversations**
   - `id` (PK), `user1_id` (FK), `user2_id` (FK), `last_message_id`, `updated_at`. 
   - *Unique Constraint:* (user1_id, user2_id).
5. **messages**
   - `id` (PK), `conversation_id` (FK), `sender_id` (FK), `message_type` (text/image), `content`, `image_url`, `is_read`, `created_at`.
6. **notifications** (Tùy chọn)
   - `id` (PK), `user_id` (FK), `type`, `content`, `is_read`, `created_at`.

---

## IV. BACKEND API (RESTFUL)
**AUTH**
- `POST /api/auth/register` - Đăng ký (Mã hóa pass).
- `POST /api/auth/login` - Đăng nhập (Trả JWT).
- `POST /api/auth/logout` - Đăng xuất.
- `GET /api/auth/me` - Lấy thông tin user (Yêu cầu JWT).

**USER & PROFILE**
- `GET /api/users/search?q=name` - Tìm kiếm user.
- `GET /api/users/:id` - Lấy thông tin 1 user.
- `PUT /api/users/profile` - Cập nhật thông tin/avatar.

**FRIEND**
- `POST /api/friends/request` - Gửi lời mời.
- `GET /api/friends/requests` - Xem danh sách lời mời.
- `POST /api/friends/request/:id/accept` - Chấp nhận kết bạn.
- `POST /api/friends/request/:id/reject` - Từ chối kết bạn.
- `GET /api/friends` - Xem danh sách bạn bè.

**CHAT & MESSAGES**
- `GET /api/conversations` - Lấy danh sách đoạn chat (Home).
- `GET /api/conversations/requests` - Lấy tin nhắn người lạ.
- `POST /api/conversations/request/:id/accept` - Chấp nhận chat với người lạ.
- `GET /api/conversations/:id/messages` - Load lịch sử tin nhắn của 1 đoạn chat.
- `POST /api/messages` - Gửi text message (Lưu DB).
- `POST /api/messages/image` - Upload ảnh & gửi message.
- `PUT /api/messages/:id/read` - Đánh dấu đã đọc.

---

## V. KIẾN TRÚC SOCKET.IO (REALTIME)
- **MUST HAVE:**
  - `connection` / `disconnect`
  - `setup` (Authenticate & lưu socket.id theo user.id)
  - `send_message` (Gửi tin)
  - `receive_message` (Nhận tin)
- **SHOULD HAVE:**
  - `user_online` / `user_offline`
  - `new_friend_request` / `friend_request_accepted`
  - `typing` / `stop_typing`
  - `message_read`

---

## VI. KIẾN TRÚC FRONTEND & STATE MANAGEMENT
**1. Các màn hình (Screens) & Navigation:**
- **Auth Stack:** `LoginScreen`, `RegisterScreen`.
- **Main Stack (React Navigation):**
  - **Tabs:** `HomeScreen` (List chat), `ProfileScreen`.
  - **Khác:** `SearchScreen`, `ChatScreen`, `FriendRequestsScreen`, `MessageRequestsScreen`, `EditProfileScreen`.

**2. State Management:**
- Sử dụng **React Context** (AuthContext) + `useState` để quản lý luồng đăng nhập.
- Sử dụng **AsyncStorage** để lưu JWT Token.

---

## VII. LUỒNG NGHIỆP VỤ (FLOWS) CỐT LÕI
- **FLOW 1 (Auth):** App khởi động -> Check AsyncStorage -> Có JWT hợp lệ -> Main Stack (Home). Không có -> Auth Stack (Login).
- **FLOW 2 (Kết bạn):** Search -> Add Friend -> API lưu Request -> Socket emit thông báo -> Người nhận Accept -> API tạo record trong bảng `friendships`.
- **FLOW 3 (Tin nhắn người lạ):** Người lạ gửi tin -> Lưu DB `messages`, conversation đánh dấu `is_request = true` -> Hiện bên tab "Tin nhắn chờ" -> Bấm Accept -> Cập nhật DB -> Chat bình thường.
- **FLOW 4 (Chat Text Realtime):** Nhập text -> Bấm gửi -> Trực tiếp gọi API `POST /messages` lưu DB -> Backend phản hồi OK & kích hoạt Socket.IO `receive_message` tới người nhận -> Frontend render.
- **FLOW 5 (Gửi ảnh):** Image Picker chọn ảnh -> Upload lên Cloudinary qua API Backend -> Lấy Image URL lưu DB -> Phát Socket URL ảnh tới người nhận.

---

## VIII. PROJECT STRUCTURE (CẤU TRÚC THƯ MỤC)
```text
chat-app/
├── backend/
│   ├── config/ (db.js, cloudinary.js)
│   ├── controllers/ (authController, chatController...)
│   ├── middlewares/ (authMiddleware, uploadMiddleware)
│   ├── models/ (Các file định nghĩa SQL)
│   ├── routes/ (authRoutes, chatRoutes...)
│   ├── sockets/ (socketHandler.js)
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/ (images, icons)
    │   ├── components/ (Button, Input, Avatar...)
    │   ├── context/ (AuthContext)
    │   ├── navigation/ (AppNavigator, AuthStack, MainStack)
    │   ├── screens/ (Home, Chat, Login...)
    │   ├── services/ (api.js, socket.js)
    │   └── utils/ (formatTime, constants)
    ├── App.js
    └── package.json

---

## IX. LỘ TRÌNH PHÁT TRIỂN (17 PHASES CHI TIẾT)

> **Nguyên tắc:** Chưa code tất cả cùng lúc. Hoàn thành từng Phase, test xong Phase hiện tại rồi mới chuyển sang Phase tiếp theo.

### PHASE 0 — Chuẩn bị môi trường & Repository
- Cài/kiểm tra Node.js, npm, JDK/Android Studio nếu chạy Android.
- Khởi tạo React Native project.
- Khởi tạo Node.js + Express backend.
- Tạo Git repository và `.gitignore`.
- Tạo MySQL database.
- Tạo file `.env.example`.
- Kiểm tra frontend, backend và database chạy độc lập.

**Kết quả:** Frontend chạy được, Backend chạy được, MySQL kết nối được.

### PHASE 1 — Database cơ bản & Backend Authentication
- Tạo bảng `users`.
- Tạo Register API.
- Hash password bằng `bcryptjs`.
- Tạo Login API.
- Tạo JWT.
- Tạo JWT middleware.
- Tạo `GET /api/auth/me`.
- Test toàn bộ Auth bằng Postman/Thunder Client.

**Kết quả:** Có thể đăng ký, đăng nhập và xác thực bằng JWT.

### PHASE 2 — Frontend Authentication
- Tạo LoginScreen.
- Tạo RegisterScreen.
- Cấu hình Axios.
- Tạo AuthContext.
- Lưu JWT bằng AsyncStorage.
- Check token khi app khởi động.
- Xử lý loading/login error.
- Kết nối Frontend với Auth API.

**Kết quả:** User có thể đăng ký/đăng nhập từ mobile app.

### PHASE 3 — Navigation & Profile
- Thiết lập React Navigation.
- Auth Stack.
- Main Bottom Tabs.
- HomeScreen.
- ProfileScreen.
- EditProfileScreen.
- API lấy/cập nhật profile.
- Upload/cập nhật avatar.
- Đăng xuất.

**Kết quả:** App có navigation hoàn chỉnh và profile cá nhân.

### PHASE 4 — Tìm kiếm người dùng
- API search user.
- Search bar trên Home.
- Debounce search nếu cần.
- Hiển thị avatar, username và thông tin cơ bản.
- Xác định trạng thái quan hệ:
  - Bạn bè
  - Đã gửi lời mời
  - Có lời mời đang chờ
  - Chưa kết bạn
  - Chính mình
- Hiển thị action phù hợp.

**Kết quả:** Có thể tìm một user và biết trạng thái quan hệ.

### PHASE 5 — Hệ thống kết bạn
- Gửi Friend Request.
- Danh sách lời mời nhận được.
- Accept.
- Reject.
- Hủy request nếu cần.
- Danh sách bạn bè.
- Chặn request trùng.
- Không cho tự kết bạn.
- Tạo notification khi có request.
- Socket realtime cho friend request/accepted nếu đã sẵn sàng.

**Kết quả:** Hoàn thành nghiệp vụ kết bạn.

### PHASE 6 — Core Conversation Database
- Thiết kế conversation 1-1.
- Đảm bảo A-B và B-A chỉ là một conversation.
- Tạo/lấy conversation.
- Lấy danh sách conversation cho Home.
- Lưu `last_message_id`.
- Cập nhật `updated_at`.
- Phân biệt conversation bình thường và Message Request.

**Kết quả:** Database quản lý được các cuộc hội thoại 1-1.

### PHASE 7 — Giao diện ChatScreen
- Header: avatar, tên, trạng thái.
- Message list.
- Text input.
- Send button.
- Image button để chuẩn bị cho Phase 10.
- Hiển thị thời gian.
- Phân biệt message của mình/người khác.
- Load lịch sử từ API.

**Kết quả:** Có thể mở ChatScreen và xem lịch sử chat.

### PHASE 8 — Tích hợp Socket.IO
- Tạo Socket.IO server.
- Tạo Socket.IO client.
- Authenticate socket bằng JWT.
- Map `userId -> socketId`.
- Xử lý connection/disconnect.
- Online/offline.
- Cleanup socket khi disconnect.

**Kết quả:** Frontend và backend kết nối realtime ổn định.

### PHASE 9 — Text Chat Realtime
- Gửi text.
- Lưu message vào MySQL.
- Emit `receive_message`.
- Receiver render message ngay.
- Cập nhật last message trên Home.
- Nếu receiver offline: message vẫn được lưu DB.
- Khi mở lại app/chat: load lịch sử từ DB.

**Kết quả:** Hoàn thành core chat realtime.

### PHASE 10 — Image Picker & Cloudinary
- Cài Image Picker.
- Chọn ảnh.
- Preview ảnh.
- Validate loại file.
- Validate kích thước.
- Upload ảnh.
- Upload Cloudinary thông qua Backend.
- Lưu URL ảnh vào message.
- Emit image message realtime.
- Hiển thị ảnh trong ChatScreen.

**Kết quả:** Gửi/nhận ảnh trong chat.

### PHASE 11 — Tin nhắn người lạ (Message Requests)
- User chưa là bạn vẫn có thể nhắn.
- Conversation được đánh dấu là request.
- Message vẫn được lưu.
- Người nhận không đưa request vào chat bình thường.
- Hiển thị khu vực `Message Requests`.
- Popup/thông báo khi có message từ người lạ.
- Accept request → chuyển thành conversation bình thường.
- Delete/ẩn request.
- Block người gửi nếu triển khai block.

**Kết quả:** Có UX tương tự Messenger ở mức đồ án.

### PHASE 12 — Typing & Read Status
- `typing`.
- `stop_typing`.
- Hiển thị “Đang nhập...”.
- `message_read`.
- Cập nhật `is_read`.
- Hiển thị trạng thái đã xem ở mức cơ bản.

**Kết quả:** Chat có trải nghiệm realtime tốt hơn.

### PHASE 13 — In-app Notification
- Notification cho Friend Request.
- Notification khi accept friend.
- Notification khi có Message Request.
- Notification tin nhắn mới khi phù hợp.
- Socket realtime.
- Danh sách notification.
- Đánh dấu đã đọc.
- Badge số lượng chưa đọc nếu cần.

**Kết quả:** Người dùng nhận được thông báo trong app.

### PHASE 14 — Error Handling
Xử lý:
- Sai tài khoản/password.
- JWT hết hạn.
- API 401/403/404/500.
- User không tồn tại.
- Request trùng.
- Conversation không tồn tại.
- Không có quyền truy cập conversation.
- Socket disconnect/reconnect.
- Database lỗi.
- Upload ảnh lỗi.
- File không phải ảnh.
- Ảnh quá lớn.
- Network timeout.

**Kết quả:** App không bị crash khi gặp lỗi thông thường.

### PHASE 15 — UI/UX & Refactor
- Chuẩn hóa màu sắc, spacing, typography.
- Loading state.
- Empty state.
- Error state.
- Keyboard handling.
- Avatar fallback.
- Format thời gian.
- Tối ưu FlatList.
- Tách component dùng chung.
- Tách service/controller/socket handler.
- Xóa code dư thừa.
- Kiểm tra naming convention.

**Kết quả:** Code sạch hơn và UI hoàn thiện hơn.

### PHASE 16 — Testing toàn hệ thống
Test theo checklist:
- Auth.
- Profile.
- Search.
- Friend.
- Conversation.
- Text chat.
- Realtime.
- Image.
- Message Request.
- Typing.
- Read status.
- Notification.
- Online/offline.
- Error handling.
- Test hai thiết bị/tài khoản đồng thời.

**Kết quả:** Tìm và sửa các lỗi trước khi build.

### PHASE 17 — Build APK
- Cấu hình Android release.
- Kiểm tra API URL production/local.
- Kiểm tra `.env`.
- Build APK.
- Cài thử trên Android thật.
- Kiểm tra lại Login → Search → Friend → Chat → Image → Message Request.
- Chuẩn bị README và hướng dẫn chạy project.

**Kết quả:** Có APK chạy được và source code có thể bàn giao.

---

## X. QUY TẮC BẢO MẬT & QUY TẮC CODE

### Bảo mật
- Không lưu password plain text.
- Hash password bằng `bcryptjs`.
- API yêu cầu JWT phải đi qua authentication middleware.
- Kiểm tra authorization: user chỉ được truy cập conversation/message mà mình có quyền.
- Dùng Prepared Statement/parameterized query để chống SQL Injection.
- Biến nhạy cảm đặt trong `.env`.
- Không commit `.env`.
- Có `.env.example`.
- Validate dữ liệu đầu vào.
- Kiểm tra loại và kích thước file ảnh.
- Không đưa secret Cloudinary/JWT/database vào source code.

### Code
- JavaScript, không tự chuyển sang TypeScript nếu chưa yêu cầu.
- Code dễ hiểu đối với sinh viên.
- Comment tại các logic phức tạp, đặc biệt Socket.IO.
- Không dồn quá nhiều logic vào một file.
- Controller xử lý request/response.
- Service xử lý business logic khi cần.
- Route định nghĩa endpoint.
- Middleware xử lý authentication/validation.
- Socket handler xử lý realtime.
- Database access tách riêng.
- Không refactor toàn bộ project chỉ để sửa một lỗi nhỏ.
- Khi sửa file phải nói rõ phần thêm/sửa/giữ nguyên.
- Test API bằng Postman/Thunder Client trước khi tích hợp frontend.

---

## XI. PACKAGE ĐỀ XUẤT

### Backend
```bash
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv socket.io multer cloudinary
```

| Package | Mục đích | Mức độ |
|---|---|---|
| express | REST API | Bắt buộc |
| mysql2 | Kết nối MySQL | Bắt buộc |
| bcryptjs | Hash password | Bắt buộc |
| jsonwebtoken | JWT | Bắt buộc |
| cors | CORS | Bắt buộc |
| dotenv | `.env` | Bắt buộc |
| socket.io | Realtime | Bắt buộc |
| multer | Nhận file upload | Có thể cần |
| cloudinary | Lưu ảnh | Nên có |

### Frontend
Các package chính:
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `@react-navigation/stack` hoặc navigator phù hợp với phiên bản React Navigation
- `axios`
- `socket.io-client`
- `@react-native-async-storage/async-storage`
- `react-native-image-picker`

> Khi bắt đầu Phase 0, cần xác định rõ dùng **React Native CLI hay Expo** vì cách cài một số package native và cách build APK khác nhau.

---

## XII. CHECKLIST ĐẦY ĐỦ CHỨC NĂNG

### Authentication
- [x] Register
- [x] Login
- [x] JWT
- [x] Password hashing
- [x] Auth middleware
- [x] Check current user
- [x] Logout

### Profile
- [x] Xem profile
- [x] Sửa profile
- [x] Avatar
- [x] Upload avatar

### User Search
- [x] Search user
- [x] Hiển thị trạng thái quan hệ
- [x] Action Add Friend
- [x] Action Message

### Friend System
- [x] Send request
- [x] Receive request
- [x] Accept
- [x] Reject
- [x] Friend list
- [x] Chặn request trùng
- [x] Không tự kết bạn
- [x] Notification request

### 1-1 Chat
- [x] Conversation 1-1
- [x] Chat history
- [x] Text message
- [x] Timestamp
- [x] Last message
- [x] Realtime
- [x] Offline message persistence
- [x] Online/offline

### Image
- [x] Image Picker
- [x] Preview
- [x] Upload
- [x] Cloudinary
- [x] Image URL
- [x] Image message
- [x] Realtime image

### Stranger Message
- [x] Người lạ vẫn có thể nhắn
- [x] Message Request
- [x] Popup/in-app notification
- [x] Accept request
- [x] Delete/ẩn request
- [x] Block (nếu triển khai)

### Realtime
- [x] Socket connection
- [x] Disconnect
- [x] Send message
- [x] Receive message
- [x] Online/offline
- [x] Friend notification
- [x] Typing
- [x] Read status

### Notification
- [x] Friend request
- [x] Accept friend
- [x] Stranger message
- [x] New message
- [x] Mark as read
- [x] Badge nếu cần

### Optional
- [ ] Voice Call
- [ ] Video Call
- [ ] Push Notification
- [ ] Emoji
- [ ] Reply
- [ ] Recall/Delete message

---

## XIII. CÁC ĐIỂM CẦN BỔ SUNG/CORRECT TRONG THIẾT KẾ DATABASE

Có 3 điểm cần đặc biệt sửa so với bản kế hoạch ban đầu:

### 1. `conversations` phải có trạng thái Message Request

Flow hiện tại sử dụng `is_request = true`, nhưng bảng `conversations` ban đầu chưa có field này.

Nên bổ sung:

```text
is_request BOOLEAN DEFAULT FALSE
request_sender_id INT NULL
```

Hoặc dùng một field trạng thái rõ ràng hơn:

```text
status ENUM('normal', 'message_request', 'blocked')
```

Khuyến nghị dùng `status` để dễ mở rộng.

### 2. `friendships` phải chuẩn hóa thứ tự user

Luôn lưu:

```text
user1_id < user2_id
```

Ví dụ A có id 10, B có id 20:

```text
user1_id = 10
user2_id = 20
```

Không được tạo record ngược:

```text
user1_id = 20
user2_id = 10
```

và đặt:

```text
UNIQUE(user1_id, user2_id)
```

### 3. `friend_requests` cần xử lý cả chiều ngược

Unique `(sender_id, receiver_id)` chỉ ngăn:

```text
A → B
A → B
```

nhưng chưa tự ngăn:

```text
A → B
B → A
```

Vì vậy business logic phải kiểm tra request đang tồn tại ở cả hai chiều trước khi tạo request mới.

Có thể thiết kế thêm cơ chế chuẩn hóa cặp user tương tự friendship nếu muốn database đảm bảo mạnh hơn.

---

## XIV. ĐIỂM CÒN THIẾU NẾU MUỐN PLAN THỰC SỰ HOÀN CHỈNH

Ngoài các chức năng chính, khi triển khai thực tế cần chốt thêm:

### 1. React Native CLI hay Expo
Phải quyết định ở Phase 0.

### 2. Cloudinary upload flow
Cần thống nhất:

```text
React Native
    ↓
Backend
    ↓
Cloudinary
    ↓
image URL
    ↓
MySQL
```

Không lưu file ảnh trực tiếp vào MySQL.

### 3. Block User
Nếu đã cho phép Message Request có nút Block thì cần có nghiệp vụ block rõ ràng.

Có thể bổ sung bảng:

```text
blocks
- id
- blocker_id
- blocked_id
- created_at
```

Nếu chưa cần, bỏ nút Block khỏi phiên bản đầu để giảm độ phức tạp.

### 4. Conversation access control
Backend phải kiểm tra user hiện tại có thuộc conversation hay không trước khi:
- Load messages
- Send message
- Mark read
- Accept request

### 5. Pagination
Lịch sử chat không nên tải toàn bộ message khi conversation có nhiều dữ liệu.

Có thể dùng:

```text
GET /api/conversations/:id/messages?page=1&limit=30
```

Nhưng có thể triển khai sau khi chat cơ bản chạy ổn.

### 6. Database transaction
Các thao tác như Accept Friend Request có nhiều bước nên có transaction:

```text
Accept Request
    ↓
Update request
    ↓
Create friendship
    ↓
Create notification
    ↓
COMMIT
```

Nếu một bước lỗi → ROLLBACK.

---

## XV. KIẾN TRÚC TỔNG THỂ CUỐI CÙNG

```text
                    ┌─────────────────────┐
                    │   React Native App  │
                    │                     │
                    │ Login / Home        │
                    │ Search / Profile    │
                    │ Chat / Notification │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                 REST API             Socket.IO
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Node.js + Express   │
                    │                     │
                    │ Auth                │
                    │ User                │
                    │ Friend              │
                    │ Conversation        │
                    │ Message             │
                    │ Notification        │
                    │ Socket Handler       │
                    └───────┬───────┬─────┘
                            │       │
                     ┌──────▼───┐   │
                     │  MySQL   │   │
                     │          │   │
                     │ Users    │   │
                     │ Friends  │   │
                     │ Chat     │   │
                     │ Messages │   │
                     └──────────┘   │
                                    │
                              ┌─────▼─────┐
                              │ Cloudinary│
                              │   Images  │
                              └───────────┘
```

---

## XVI. ROADMAP ĐỀ XUẤT CUỐI CÙNG

```text
PHASE 0
   ↓
PHASE 1 — Backend Auth + DB
   ↓
PHASE 2 — Frontend Auth
   ↓
PHASE 3 — Navigation + Profile
   ↓
PHASE 4 — Search
   ↓
PHASE 5 — Friend System
   ↓
PHASE 6 — Conversation
   ↓
PHASE 7 — Chat UI
   ↓
PHASE 8 — Socket.IO
   ↓
PHASE 9 — Realtime Text Chat
   ↓
PHASE 10 — Image
   ↓
PHASE 11 — Stranger Message
   ↓
PHASE 12 — Typing + Read
   ↓
PHASE 13 — Notification
   ↓
PHASE 14 — Error Handling
   ↓
PHASE 15 — UI/UX + Refactor
   ↓
PHASE 16 — Testing
   ↓
PHASE 17 — APK
   ↓
OPTIONAL — WebRTC Call
```

### Quan trọng nhất
1. Authentication
2. Database
3. Conversation
4. Socket.IO
5. Realtime Text Chat
6. Message Request

### Khó nhất
1. Socket.IO + quản lý connection
2. Conversation 1-1
3. Message Request người lạ
4. Realtime + offline state
5. Upload ảnh
6. WebRTC Call

### Nếu thiếu thời gian
Có thể bỏ theo thứ tự:

1. WebRTC Call
2. Push Notification
3. Emoji/Reply/Recall
4. Typing Indicator
5. Read Status nâng cao

**Không nên bỏ:**

- Auth
- Profile
- Search
- Friend
- Conversation
- Text Chat
- Socket.IO
- Message Request
- MySQL

### Nếu còn nhiều thời gian

Sau khi Phase 17 hoàn thành mới cân nhắc:

```text
WebRTC
   ↓
Voice Call
   ↓
Video Call
   ↓
Firebase Push Notification
```

---

## XVII. TRẠNG THÁI ĐÁNH GIÁ PLAN

**Đánh giá:** PLAN hiện tại đã đủ để bắt đầu triển khai đồ án.

Các chức năng ban đầu bạn yêu cầu đều đã được bao phủ:

- Chat 1-1
- Text
- Ảnh
- Realtime
- Profile
- Search
- Kết bạn
- Popup lời mời kết bạn
- Người lạ vẫn có thể nhắn
- Message Request giống Messenger
- MySQL
- Node.js + Express
- React Native
- Socket.IO
- Cloudinary
- JWT

**Các điểm cần chốt trước khi code:** React Native CLI hay Expo, schema database cuối cùng, cách upload Cloudinary và có/không có Block User.

**Nguyên tắc triển khai:** không bắt đầu WebRTC trước khi chat text + image + message request + realtime hoạt động ổn định.
