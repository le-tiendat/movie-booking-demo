# Movie Booking Demo - DBMS Transaction & Locking

Dự án này là một ứng dụng minh họa cách xử lý tranh chấp dữ liệu (race conditions) trong hệ quản trị cơ sở dữ liệu (MySQL) bằng cách sử dụng **Transactions** và **Row-level Locking**.

## 🚀 Giới thiệu
Trong các hệ thống đặt vé, việc nhiều người cùng nhấn đặt một chiếc ghế cuối cùng tại cùng một thời điểm là vấn đề phổ biến. Nếu không được xử lý đúng cách, hệ thống có thể xảy ra lỗi **Overbooking** (một ghế bán cho nhiều người).

Demo này cung cấp hai phương thức đặt vé:
1.  **Unsafe Booking**: Không sử dụng Lock, dễ dẫn đến lỗi khi có tranh chấp.
2.  **Safe Booking**: Sử dụng `SELECT ... FOR UPDATE` để khóa dòng dữ liệu, đảm bảo tính toàn vẹn.

## 🛠 Công nghệ sử dụng
*   **Backend**: Node.js, Express
*   **Database**: MySQL 8.0
*   **Tools**: Docker, Docker Compose

## 🏃 Cách chạy dự án (Khuyên dùng Docker)

### Yêu cầu
*   Đã cài đặt **Docker Desktop**.

### Các bước thực hiện
1.  Mở terminal tại thư mục gốc của dự án.
2.  Khởi động các dịch vụ:
    ```bash
    docker-compose up -d
    ```
3.  Truy cập ứng dụng:
    *   **Giao diện người dùng**: [http://localhost:3001](http://localhost:3001)
    *   **API danh sách ghế**: [http://localhost:3001/seats](http://localhost:3001/seats)

## 🧪 Kịch bản thử nghiệm

### 1. Thử nghiệm lỗi (Unsafe)
*   Mở 2 tab trình duyệt tại địa chỉ [http://localhost:3001](http://localhost:3001).
*   Chọn cùng một ghế (ví dụ: A1).
*   Nhấn nút **"Unsafe Book"** ở cả hai tab gần như cùng lúc.
*   **Kết quả**: Cả hai tab đều có thể báo thành công (do server giả lập độ trễ 2s mà không có cơ chế khóa).

### 2. Thử nghiệm an toàn (Safe)
*   Nhấn nút **"Reset"** để xóa trắng các lượt đặt ghế.
*   Lặp lại các bước trên nhưng nhấn nút **"Safe Book"**.
*   **Kết quả**: Tab nhấn trước sẽ thành công, tab nhấn sau sẽ phải chờ và sau đó nhận thông báo "Ghế đã bị đặt".

## 📂 Cấu trúc dự án

```text
movie-booking-demo/
├── docker-compose.yml
├── Dockerfile
├── init.sql
├── package.json
├── server.js
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

### Chi tiết các file:
*   `server.js`: Chứa logic chính về API và xử lý Transaction.
*   `public/`: Chứa file giao diện (HTML/CSS/JS).
*   `init.sql`: File khởi tạo cấu trúc bảng và dữ liệu mẫu.
*   `docker-compose.yml`: Cấu hình môi trường chạy nhanh.

---
*Dự án được tạo ra nhằm mục đích học tập về hệ quản trị cơ sở dữ liệu.*
