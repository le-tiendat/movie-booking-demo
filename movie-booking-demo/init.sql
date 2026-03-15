USE booking_demo;

CREATE TABLE IF NOT EXISTS seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seat_number VARCHAR(10) UNIQUE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_by VARCHAR(50) DEFAULT NULL
);

INSERT INTO seats (seat_number) VALUES
('A1'), ('A2'), ('A3'), ('A4'), ('A5');
