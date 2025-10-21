const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",  // change to your MySQL root password
  database: "oceanfresh"
});

// Test DB Connection
db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    process.exit();
  }
  console.log("✅ Connected to MySQL");
});

// API to Save Order
app.post("/save-order", (req, res) => {
  const { name, address, phone, items, total } = req.body;

  if (!name || !address || !phone || !items) {
    return res.json({ success: false, message: "⚠️ Missing required fields" });
  }

  const sql = `INSERT INTO orders 
    (customer_name, customer_address, customer_phone, order_items, total_price) 
    VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [name, address, phone, JSON.stringify(items), total], (err) => {
    if (err) {
      console.error("❌ Error saving order:", err);
      return res.json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "✅ Order saved successfully!" });
  });
});

// API to Get Orders (Admin Panel)
app.get("/orders", (req, res) => {
  db.query("SELECT * FROM orders ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("❌ Error fetching orders:", err);
      return res.json({ success: false, message: "Database error" });
    }
    res.json({ success: true, data: results });
  });
});

// Start Server
app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
