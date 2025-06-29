const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  port: 1433,
  options: {
    encrypt: false, // true para Azure, false para SQL Server local
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("Conectado ao SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("Erro ao conectar ao SQL Server:", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
