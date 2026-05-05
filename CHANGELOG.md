# CourtManager v2.0 - Changelog

## [2026-05-05] - Party Mode Security & Performance Audit

**Chiến dịch "Party Mode" rà soát toàn bộ hệ thống bằng AI Multi-Agent.** Đã vá thành công 9 lỗi liên quan đến bảo mật Multi-tenant, UI/UX và Performance trên toàn bộ 6 màn hình lõi.

### 🛡️ Bảo mật & Multi-Tenant (Security)
- **Fixed IDOR trên trang HLV Điểm Danh (`/coach/classes/[id]`):** Chặn đứng lỗ hổng cho phép HLV sửa đổi URL `scheduleId` để truy cập và xem/sửa danh sách học viên của một học viện khác. Đã bổ sung `.eq('classes.academy_id', academyId)` và dùng `!inner` join.
- **Fixed Mass Data Leak trang Lớp Học (`/classes`):** Ngăn chặn query `student_classes` kéo toàn bộ bảng dữ liệu của hệ thống về server bằng cách thêm filter `.in('class_id', classIds)`.
- **Fixed Lộ lịch học trang HLV (`/coach`):** Ngăn HLV nhìn thấy lịch học của học viện khác do thiếu `academy_id` filter trên bảng `schedules`.

### 🚀 Tối ưu Hiệu suất & UX (Performance & UX)
- **Tối ưu Avatar Upload:** Thêm logic resize ảnh về `400x400` và nén chất lượng (`quality = 0.8`), giảm dung lượng ảnh từ điện thoại từ `~3MB` xuống còn `~50KB`, giúp Server Actions chạy siêu tốc.
- **Sửa lỗi Race Condition (Idempotency):** Sửa lỗi mạng lag khiến HLV phụ bị "nhân bản" làm nhiều bản ghi chấm công bằng cách thêm logic kiểm tra trùng lặp tại server action `markAssistantAttendance`.
- **Giao diện thân thiện khi rớt mạng:** Thêm thông báo hiển thị Alert tiếng Việt dễ hiểu thay vì lỗi console tĩnh khi điểm danh hàng loạt (`markAttendanceBulk`) thất bại.
- **Thay UI báo lỗi JWT Debug:** Xóa các câu text báo lỗi kỹ thuật `Thẻ bài JWT thất bại` cho HLV và chuyển thành lệnh `redirect('/login')` an toàn.
- **Brand Name Động:** Xóa chuỗi hardcode "Sunday - Sunset" trên Sidebar và Topbar thay bằng `academyName` lấy từ DB, giúp các Tenant khác tự thấy thương hiệu của họ.
- **Tối ưu Thống kê (`/analytics`):** Tối ưu hóa truy vấn Supabase bằng cách dùng trực tiếp cột `academy_id` có sẵn trên bảng `attendances` thay vì join qua bảng `classes`.

### 🐞 Fix Bugs Logic (Bug Fixes)
- **Lỗi đếm số ca hoạt động Dashboard luôn bằng 0:** Khắc phục lỗi variable shadowing bên trong khối `try-catch` khiến thông số `activeSchedulesCount` không bao giờ cập nhật ra giao diện Admin.
- **Lỗi gói học phí chẵn (modulo bug):** Khắc phục lỗi UI khi học viên học đủ bội số của 36 buổi (VD: `36 % 36 = 0`), hiển thị `0/36` thành đúng `36/36`.
- **Lỗi VIP List đếm trọn đời tốn tài nguyên:** Giới hạn phạm vi tính `Top Điểm Danh` vào trong tháng hiện tại giúp giảm thiểu tối đa tài nguyên database thay vì kéo trọn đời.
- **Lỗi API Crash (Smart Fallback):** Sửa lỗi `classes.coach_id` không tồn tại thành `classes.head_coach_id` để tránh Supabase PostgREST văng lỗi 400.

---

*Đây là đợt vá lỗi hoàn chỉnh giúp CourtManager v2.0 đạt tiêu chuẩn SaaS Production Ready trước khi handover cho Client thử nghiệm diện rộng.*
