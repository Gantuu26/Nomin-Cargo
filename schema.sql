DROP TABLE IF EXISTS TrackingLogs;
DROP TABLE IF EXISTS Orders;

CREATE TABLE Orders (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  branch TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  item_category TEXT NOT NULL,
  item_quantity INTEGER NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT '주문 접수'
);

CREATE TABLE TrackingLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT,
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
);

-- Insert a sample tracking log for demonstration
-- INSERT INTO Orders (id, type, branch, sender_name, sender_phone, sender_address, item_category, item_quantity, receiver_name, receiver_phone, receiver_address) 
-- VALUES ('NM12345678', 'standard', 'Салбар 1', 'Test Sender', '010-1234-5678', 'Seoul', 'Clothes', 2, 'Test Receiver', '99112233', 'Ulaanbaatar');
-- INSERT INTO TrackingLogs (order_id, status, location, description) VALUES ('NM12345678', '주문 접수', '웹사이트', '고객님이 주문을 완료했습니다.');
