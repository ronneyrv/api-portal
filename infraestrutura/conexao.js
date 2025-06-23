const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "portal_pptm"
});

module.exports = db;
