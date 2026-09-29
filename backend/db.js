const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 4000,

  // =====================================================
  // TiDB Cloud Starter TLS
  // =====================================================
  ssl: {
    minVersion: "TLSv1.2",
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Keep MySQL DATE values as YYYY-MM-DD
  dateStrings: true,
});

async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      "SELECT DATABASE() AS database_name"
    );

    console.log("✅ TiDB Connected Successfully");
    console.log(
      "📦 Database:",
      rows[0]?.database_name || process.env.DB_NAME
    );
  } catch (error) {
    console.error("❌ TiDB Connection Failed:");
    console.error(error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

testConnection();

module.exports = pool;