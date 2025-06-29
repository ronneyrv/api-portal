const { poolPromise, sql } = require("../infraestrutura/conexao");

class PolimeroModel {
  async condicao() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM statuspolimero");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao verificar a condição do polímero:", err);
      throw err;
    }
  }

  async volume() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM volumePolimero");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao verificar o volume de polímero:", err);
      throw err;
    }
  }
}

module.exports = new PolimeroModel();
