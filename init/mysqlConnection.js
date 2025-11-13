// backend/init/mysqlConnection.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // change if needed
  database: "payroll_system",
  connectionLimit: 10,
});

export default db;
