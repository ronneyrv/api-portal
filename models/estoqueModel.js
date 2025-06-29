const { poolPromise, sql } = require("../infraestrutura/conexao");

class EstoqueModel {
  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT TOP 1 * FROM estoque ORDER BY id DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar estoque:", err);
      throw err;
    }
  }
}

module.exports = new EstoqueModel();
