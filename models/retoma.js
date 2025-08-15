const { poolPromise, sql } = require("../infraestrutura/conexao");

class RetomaModel {
  async listar(data, turno) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('data', sql.Date, data)
        .input('turno', sql.VarChar, turno)
        .query('SELECT * FROM realRetoma WHERE data = @data AND turno = @turno');
      
      return result.recordset;

    } catch (err) {
      console.error("Erro ao buscar retoma:", err);
      throw err;
    }
  }
}

module.exports = new RetomaModel();