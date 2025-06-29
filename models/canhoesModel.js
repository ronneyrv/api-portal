const { poolPromise, sql } = require("../infraestrutura/conexao");

class canhoesModel {
  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT id, can, modo, posicao FROM canhoes");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar canhões:", err);
      throw err;
    }
  }

  async atualizar(can, modo) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("modo", sql.VarChar, modo)
        .input("can", sql.Int, can)
        .query("UPDATE canhoes SET modo = @modo WHERE can = @can");
      return result;
    } catch (err) {
      console.error("Erro ao atualizar modo do canhão:", err);
      throw err;
    }
  }

  async modo() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM statusHumectacao");
      return result.recordset;
    } catch (err) {
      console.error("Erro no status do sistema:", err);
      throw err;
    }
  }

  async atualizarModo(disponivel) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("disponivel", sql.Int, disponivel)
        .query("UPDATE statusHumectacao SET disponivel = @disponivel");
      return result;
    } catch (err) {
      console.error("Erro ao atualizar status de humectação:", err);
      throw err;
    }
  }
}

module.exports = new canhoesModel();
