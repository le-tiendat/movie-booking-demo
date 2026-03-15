const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const db = mysql.createPool({
  host: "mysql",
  user: "root",
  password: "root",
  database: "booking_demo",
});

// Lấy danh sách ghế
app.get("/seats", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM seats");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset trạng thái ghế (để demo nhiều lần)
app.post("/reset-seats", async (req, res) => {
  try {
    await db.query("UPDATE seats SET is_booked = 0, booked_by = NULL");
    res.json({ message: "Seats reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mua vé KHÔNG dùng Lock (Dễ gây lỗi Overbooking)
app.post("/book-unsafe", async (req, res) => {
  const { seatId, userName } = req.body;
  const connection = await db.getConnection();

  try {
    // 1. Kiểm tra xem ghế còn trống không
    const [rows] = await connection.query(
      "SELECT is_booked FROM seats WHERE id = ?",
      [seatId]
    );

    if (rows.length === 0) throw new Error("Seat not found");
    if (rows[0].is_booked) throw new Error("Seat already booked");

    // Giả lập độ trễ mạng/xử lý (2 giây) để dễ xảy ra tranh chấp
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Cập nhật trạng thái đặt ghế
    await connection.query(
      "UPDATE seats SET is_booked = 1, booked_by = ? WHERE id = ?",
      [userName, seatId]
    );

    res.json({ message: `Successfully booked by ${userName} (Unsafe)` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Mua vé CÓ dùng Lock (An toàn - DBMS bảo vệ)
app.post("/book-safe", async (req, res) => {
  const { seatId, userName } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Kiểm tra và KHÓA dòng (SELECT ... FOR UPDATE)
    // Các transaction khác muốn đọc/ghi dòng này sẽ phải ĐỢI
    const [rows] = await connection.query(
      "SELECT is_booked FROM seats WHERE id = ? FOR UPDATE",
      [seatId]
    );

    if (rows.length === 0) throw new Error("Seat not found");
    if (rows[0].is_booked) {
      await connection.rollback();
      return res.status(400).json({ error: "Seat already booked by someone else" });
    }

    // Giả lập độ trễ mạng (2 giây)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Cập nhật trạng thái
    await connection.query(
      "UPDATE seats SET is_booked = 1, booked_by = ? WHERE id = ?",
      [userName, seatId]
    );

    await connection.commit();
    res.json({ message: `Successfully booked by ${userName} (Safe)` });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Booking server running on port ${PORT}`);
});
