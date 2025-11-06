const mysql = require("mysql");

const mysqlConnectionDMS = mysql.createPool({
  host: process.env.MYSQL_DMS_HOST,
  port: parseInt(process.env.MYSQL_DMS_PORT, 10),
  user: process.env.MYSQL_DMS_USER,
  password: process.env.MYSQL_DMS_PASSWORD,
  database: process.env.MYSQL_DMS_DATABASE,
  multipleStatements: process.env.MYSQL_DMS_MULTIPLE_STATEMENTS === "true",
  connectTimeout: 20000, // 20 seconds
  acquireTimeout: 30000, // wait longer to get a connection
  connectionLimit: 20, // You can increase this if needed
});

// Optional: Ping DB to verify pool config
mysqlConnectionDMS.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL pool connection failed:", err.message);
  } else {
    console.log("MySQL pool connected.");
    connection.release(); // Important: release back to pool
  }
});

module.exports = mysqlConnectionDMS;
