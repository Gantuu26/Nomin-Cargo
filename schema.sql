DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS containers;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS pre_alert_configs;

CREATE TABLE containers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    branch TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    container_id TEXT REFERENCES containers(id),
    
    sender_name TEXT,
    sender_phone TEXT,
    sender_address TEXT,
    
    receiver_name TEXT,
    receiver_phone TEXT,
    receiver_address TEXT,
    
    item_category TEXT,
    item_quantity TEXT
);

CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pre_alert_configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
