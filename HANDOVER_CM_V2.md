# 🏀 CourtManager v2.0 - SaaS & Finance Handover

## 🌟 Tổng quan dự án
CourtManager v2.0 đã được chuyển đổi thành một nền tảng **SaaS Đa học viện (Multi-tenant)** hoàn chỉnh với hệ thống quản lý tài chính và điểm danh tự động. Hệ thống hiện đã sẵn sàng để vận hành thương mại.

---

## 🛠 Các Module đã hoàn thiện

### 1. Kiến trúc SaaS & Bảo mật
- **Tenant Isolation**: Dữ liệu giữa các học viện được cô lập tuyệt đối thông qua `BaseService`.
- **Role-based Access**: Phân quyền rõ ràng giữa Chủ học viện (Owner), Admin và Huấn luyện viên (Coach).
- **Impersonation**: Hệ thống nhập vai dành cho Super Admin để hỗ trợ kỹ thuật.

### 2. Quản lý Tài chính (Finance 2.0)
- **Gói học phí (Tuition Packages)**: Tự động tính toán giá và số buổi.
- **Phiếu thu thông minh**: Tự động cộng số dư buổi tập (`session_balance`) cho học viên khi nạp phí.
- **Báo cáo chuyên sâu**: Biểu đồ tăng trưởng doanh thu 6 tháng và cơ cấu gói học phí.

### 3. Điểm danh & Lương thưởng (Cập nhật Mới nhất)
- **Điểm danh Hàng loạt (Bulk Attendance)**: Điểm danh nhanh cả lớp đồng thời trừ chính xác số buổi của học viên (Tích hợp Auto-Refund nếu Hủy ca).
- **Auto-Refund khi Hủy ca**: Tự động nhận diện và hoàn lại buổi học cho các bé đã bị đánh dấu "Có mặt" nếu như HLV Hủy ca do trời mưa/sự cố.
- **Tính lương theo GPS**: Lương HLV được tính hoàn toàn tự động dựa trên **Lịch sử Check-in GPS hợp lệ** tại sân, độc lập với việc ai là người cầm máy bấm điểm danh, giúp tránh gian lận hoàn toàn.

### 4. Hệ thống Đánh giá Tiến bộ (Student Progress)
- **Skill Assessment**: Chấm điểm 5 kỹ năng bóng rổ cốt lõi (Nhồi bóng, Ném rổ, Thể lực, IQ, Chuyền bóng).
- **Radar Chart**: Biểu đồ mạng nhện trực quan hóa năng lực học viên ngay tại hồ sơ.

### 5. Cổng thông tin Phụ huynh (Parent Portal)
- **Link truy cập nhanh**: Phụ huynh xem báo cáo của con qua link bí mật (không cần mật khẩu).
- **Tra cứu số buổi**: Phụ huynh tự biết con còn bao nhiêu buổi để chủ động nạp thêm phí.

### 6. Tối ưu hóa Mobile
- **Bottom Navigation**: Thanh điều hướng dưới chuyên nghiệp cho điện thoại.
- **Card-based UI**: Thẻ học viên to, rõ ràng, dễ bấm cho HLV thao tác trên sân.

---

## 🚀 Hướng dẫn vận hành nhanh cho Sếp
1. **Tạo Gói học phí**: Vào mục *Tài chính* > *Quản lý Gói học phí* để thiết lập các gói (ví dụ: Gói 8 buổi, 12 buổi).
2. **Nạp phí cho học viên**: Tại trang *Tài chính*, nhấn *Ghi nhận thanh toán* > Chọn học viên và Gói. Hệ thống sẽ tự nạp buổi tập.
3. **Điểm danh**: HLV vào mục *Điểm danh* > Chọn ca học > Tích chọn trạng thái. Số buổi sẽ tự động trừ.
4. **Chấm điểm**: Vào hồ sơ học viên, kéo các thanh trượt kỹ năng và nhấn *Lưu đánh giá*.
5. **Gửi link cho phụ huynh**: Tại hồ sơ học viên, nhấn *Mở cổng PH* hoặc Copy link để gửi qua Zalo cho phụ huynh.

---

## 🛡 Bảo mật & Cam kết
Hệ thống đã trải qua đợt rà soát bảo mật `SecurityAuditReport.md`. Mọi truy vấn đều được bảo vệ bởi lớp `academy_id` filter. Dữ liệu tài chính được xử lý bằng các giao dịch nguyên tử (Atomic Operations) để tránh sai sót.

**CourtManager - Sẵn sàng bứt phá cùng các học viện bóng rổ!**
