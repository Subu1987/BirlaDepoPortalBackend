const mysql = require("mysql");

const mysqlConnection = mysql.createPool({
  connectionLimit: 20, // Adjust this number based on expected traffic
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT, 10),
  user: process.env.MYSQL_USER,
  password: "birla@admin12#",
  database: process.env.MYSQL_DATABASE,
  multipleStatements: process.env.MYSQL_MULTIPLE_STATEMENTS === "true",
  connectTimeout: 20000, // 20 seconds
  acquireTimeout: 30000, // wait longer to get a connection
  connectionLimit: 10,
});

// Optional: Test one connection from the pool
mysqlConnection.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL pool connection failed:", err.message);
  } else {
    console.log("MySQL pool connected.");
    connection.release(); // Important: release it back to the pool
  }
});

module.exports = mysqlConnection;