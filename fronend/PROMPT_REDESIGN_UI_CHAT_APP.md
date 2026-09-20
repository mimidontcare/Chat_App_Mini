# PROMPT REDESIGN TOÀN BỘ UI/UX - CHAT APP

Tôi muốn bạn redesign TOÀN BỘ giao diện frontend của ứng dụng chat này.

UI UX Pro Max skill đã được cài vào project. Hãy sử dụng skill này trong toàn bộ quá trình thiết kế và triển khai UI/UX.

## 1. MỤC TIÊU

Thiết kế lại toàn bộ frontend để ứng dụng:
- Thân thiện với người dùng mới.
- Dễ hiểu và dễ thao tác.
- Có cảm giác như một ứng dụng chat hiện đại.
- Lấy cảm hứng từ UX của Messenger, WhatsApp và các ứng dụng chat phổ biến, nhưng không sao chép nguyên mẫu.
- Ưu tiên Android/iOS.
- Sạch, hiện đại, tối giản.
- Chức năng dễ nhìn, dễ tìm.
- Có loading, empty, error và success state rõ ràng.

Luồng:
Search → kết bạn → nhắn tin → nhận tin → xem cuộc trò chuyện
phải thật trực quan.

## 2. TRƯỚC KHI CODE

Hãy:
1. Đọc PROJECT_PLAN.md nếu tồn tại.
2. Đọc toàn bộ cấu trúc frontend hiện tại.
3. Kiểm tra screen, component, navigation và style.
4. Xác định UI cần giữ và UI cần redesign.
5. Sử dụng UI UX Pro Max skill để xây dựng Design System mới.

KHÔNG code ngay.

Trước tiên hãy đưa:
- UI/UX direction
- Design system
- Color palette
- Typography
- Spacing
- Border radius
- Button/Input/Avatar/Icon/Card style
- Chat bubble
- Bottom navigation
- Header
- Search UI
- Friend request UI
- Message request UI
- Notification UI
- Loading / Empty / Error states

Sau đó mới implementation.

## 3. DESIGN SYSTEM

Tạo design system thống nhất:
- Background
- Primary/secondary
- Success/warning/error
- Text chính/phụ
- Border/divider/surface
- Disabled state

Không sử dụng quá nhiều màu. Typography dễ đọc trên mobile.

Component cần có normal, pressed, disabled, loading và error state khi phù hợp.

## 4. BOTTOM NAVIGATION

Thiết kế lại Bottom Tab:
1. Home
2. Messages
3. Friends
4. Profile

Mỗi tab có icon, label, active state, badge khi cần và dễ bấm bằng một tay.

## 5. HOME SCREEN

Header thân thiện, avatar, tiêu đề và notification icon nếu cần.

Search bar nổi bật với placeholder:
"Tìm kiếm bạn bè hoặc người dùng..."

Có search icon, clear button và loading.

Bên dưới có thể có:
- Recent conversations
- Suggested friends
- Friend requests
- Message requests

Không làm Home quá nhiều thông tin.

## 6. MESSAGE / CHAT LIST

Mỗi conversation:
- Avatar
- Online status
- Username
- Last message
- Thời gian
- Unread badge
- Message preview

Khi nhấn → ChatScreen.

Empty state:
"Chưa có cuộc trò chuyện nào"
"Bạn có thể tìm kiếm bạn bè để bắt đầu trò chuyện."
Button: "Tìm bạn bè"

## 7. CHAT SCREEN

Đây là màn hình QUAN TRỌNG NHẤT.

Header:
- Back
- Avatar
- Username
- Online/Offline
- Có thể có call button nếu sau này hỗ trợ.

Message area:
- Tin nhắn mình bên phải.
- Người khác bên trái.
- Bubble rõ ràng.
- Border radius hợp lý.
- Khoảng cách hợp lý.

Hiển thị:
- Text
- Image
- Time
- Read status
- Sending
- Failed
- Typing indicator

## 8. MESSAGE INPUT

Message composer:
[ + ] [ Nhập tin nhắn... ] [Send]

Có thể hỗ trợ image picker, emoji/attachment sau này.

Khi chưa nhập: Send disabled/phù hợp.
Khi nhập: Send nổi bật.

Input phải tự mở rộng khi text dài, không che keyboard, không overflow và có keyboard avoidance.

## 9. SEARCH SCREEN

Khi chưa nhập:
"Tìm kiếm bạn bè hoặc người dùng"

Có loading khi search.

Kết quả hiển thị:
- Avatar
- Username
- Trạng thái bạn bè
- Thêm bạn / Bạn bè / Đã gửi lời mời / Nhắn tin

## 10. FRIEND REQUEST

Mỗi request:
- Avatar
- Username
- Thời gian
- Chấp nhận
- Từ chối

Sau accept hiển thị feedback "Đã trở thành bạn bè".

## 11. MESSAGE REQUESTS

Khu vực "Tin nhắn chờ" cho người chưa phải bạn bè.

Mỗi request:
- Avatar
- Username
- Message preview
- Time
- Chấp nhận
- Từ chối
- Mở cuộc trò chuyện

Giải thích:
"Tin nhắn từ người chưa có trong danh sách bạn bè."

## 12. PROFILE / EDIT PROFILE

Profile:
- Avatar lớn
- Username
- Email
- Edit Profile
- Settings
- Logout

Edit:
- Avatar
- Username
- Email
- Lưu thay đổi
- Loading/Success/Error

## 13. LOGIN / REGISTER

Login:
- Logo/app icon
- Welcome
- Email/username
- Password
- Show/hide password
- Login
- Register

Register:
- Username
- Email
- Password
- Confirm password
- Register
- Login

Validation hiển thị gần field lỗi, ví dụ:
"Email không hợp lệ"
"Mật khẩu phải có ít nhất 6 ký tự"

Không dùng alert quá nhiều.

## 14. LOADING / EMPTY / ERROR

Toàn app có UI state thống nhất.

Loading: Skeleton hoặc ActivityIndicator phù hợp.

Empty:
- Icon/illustration đơn giản
- Message ngắn
- Action nếu cần

Error:
- Message dễ hiểu
- Retry

Không hiển thị lỗi kỹ thuật như AxiosError cho người dùng.
Dùng: "Không thể tải dữ liệu. Vui lòng thử lại."

## 15. NOTIFICATION

Thiết kế notification thống nhất cho:
- Friend request
- Friend request accepted
- New message
- Message request

Có unread badge và nội dung dễ hiểu.

## 16. MOBILE UX

Đây là MOBILE APP, không phải website.

Chú ý:
- Android/iOS
- Màn hình nhỏ/lớn
- Keyboard
- Safe area
- Touch target
- Scroll
- Keyboard avoidance
- Notch
- Bottom navigation

Không để text bị cắt hoặc UI overflow.

## 17. UX PRINCIPLES

Ưu tiên:
1. Simplicity
2. Clarity
3. Consistency
4. Fast interaction
5. Easy navigation
6. Clear feedback

Người dùng mới phải hiểu app mà không cần hướng dẫn dài.

Không tạo quá nhiều popup hoặc animation. Chỉ dùng animation khi giúp UX.

## 18. COMPONENT ARCHITECTURE

Tạo/refactor reusable components khi cần:

components/
  Avatar
  Button
  Input
  SearchBar
  ChatBubble
  MessageItem
  ConversationItem
  FriendRequestItem
  MessageRequestItem
  NotificationItem
  Loading
  EmptyState
  ErrorState
  OnlineStatus
  Badge

Không duplicate UI code.
Tổ chức style/theme thống nhất.
Không viết inline style tràn lan.

## 19. KHÔNG PHÁ VỠ LOGIC HIỆN TẠI

Chỉ redesign UI/UX.

KHÔNG tự ý thay đổi:
- Backend
- Database
- API contract
- Authentication
- JWT
- Socket.IO
- Cloudinary
- Database structure

Nếu component đang gọi API thì giữ nguyên logic API.
Không đổi technology stack.
Không chuyển JavaScript sang TypeScript.
Không thêm UI framework khác nếu không được yêu cầu.

## 20. IMPLEMENTATION PROCESS

Thực hiện theo thứ tự:
1. Audit frontend.
2. Đọc PROJECT_PLAN.md.
3. Sử dụng UI UX Pro Max skill.
4. Tạo Design System.
5. Redesign shared components.
6. Redesign Navigation.
7. Redesign Login/Register.
8. Redesign Home.
9. Redesign Message List.
10. Redesign ChatScreen.
11. Redesign Search.
12. Redesign Friend Requests.
13. Redesign Message Requests.
14. Redesign Profile/Edit Profile.
15. Thêm Loading/Empty/Error states.
16. Kiểm tra UI consistency.
17. Chạy và kiểm tra Android.

## 21. QUY TẮC CODE

- React Native + JavaScript.
- Code đơn giản, dễ hiểu.
- Không over-engineering.
- Không tạo file không cần thiết.
- Không thêm dependency nếu không cần.
- Tái sử dụng component.
- Comment logic UI phức tạp.
- Naming nhất quán.
- Không xóa logic backend.
- Không thay đổi API.

## 22. FINAL CHECK

Sau khi hoàn thành:
1. Chạy project.
2. Kiểm tra navigation.
3. Login.
4. Register.
5. Home.
6. Search.
7. Friend Request.
8. Message Request.
9. Chat.
10. Profile.
11. Keyboard.
12. Scrolling.
13. Loading.
14. Empty state.
15. Error state.
16. Console errors.
17. UI trên màn hình nhỏ.

Cuối cùng báo cáo:
- File đã tạo.
- File đã sửa.
- Component đã tạo.
- Component đã refactor.
- Package đã thêm nếu có.
- Vấn đề còn tồn tại.
- Cách chạy project.

## YÊU CẦU CUỐI CÙNG

Đừng chỉ đổi màu sắc.

Tôi muốn REDESIGN TOÀN BỘ UX/UI để ứng dụng có cảm giác thân thiện, trực quan và hiện đại như một ứng dụng chat thực tế.

Ưu tiên trải nghiệm người dùng hơn việc làm giao diện quá cầu kỳ.

Nếu gặp vấn đề hoặc phát hiện logic hiện tại không phù hợp với redesign, hãy báo cho tôi trước khi thay đổi logic.
