const { poolPromise, sql } = require("../infraestrutura/conexao");

class ObservacaoModel {
  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM obsRot");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar observações:", err);
      throw err;
    }
  }

  async atualizar(newObs, id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("observacao", sql.VarChar, newObs)
        .input("id", sql.Int, id)
        .query("UPDATE obsRot SET observacao = @observacao WHERE id = @id");
      return result;
    } catch (err) {
      console.error("Erro ao atualizar observação:", err);
      throw err;
    }
  }

  async listarEvento() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM evento_andamento");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar evento:", err);
      throw err;
    }
  }

  async atualizarEvento(newEvent, id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("andamento", sql.VarChar, newEvent)
        .input("id", sql.Int, id)
        .query("UPDATE evento_andamento SET andamento = @andamento WHERE id = @id");
      return result;
    } catch (err) {
      console.error("Erro ao atualizar evento:", err);
      throw err;
    }
  }
}

module.exports = new ObservacaoModel();
