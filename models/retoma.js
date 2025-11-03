const { poolPromise, sql } = require("../infraestrutura/conexao");

class RetomaModel {
  async listarTudo() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM retoma_realizada");

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar lista:", err);
      throw err;
    }
  }

  async listar(data, turno) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("data", sql.Date, data)
        .input("turno", sql.VarChar, turno)
        .query(
          "SELECT * FROM retoma_realizada WHERE data = @data AND turno = @turno ORDER BY inicio ASC"
        );

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar retoma:", err);
      throw err;
    }
  }

  async adicionar(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("data", sql.VarChar, dados.data)
        .input("turno", sql.VarChar, dados.turno)
        .input("ug", sql.VarChar, dados.ug)
        .input("maquina", sql.VarChar, dados.maquina)
        .input("pilha", sql.VarChar, dados.pilha)
        .input("inicio", sql.DateTime, dados.inicio)
        .input("fim", sql.DateTime, dados.fim)
        .input("volume", sql.Float, dados.volume)
        .input("especialidade", sql.VarChar, dados.especialidade || "OPERAÇÃO")
        .input("classificacao", sql.VarChar, dados.classificacao)
        .input("observacao", sql.VarChar, dados.observacao).query(`
          INSERT INTO retoma_realizada
          (data, turno, ug, maquina, pilha, inicio, fim, volume, especialidade, classificacao, observacao)
          VALUES (@data, @turno, @ug, @maquina, @pilha, @inicio, @fim, @volume, @especialidade, @classificacao, @observacao)
        `);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      throw err;
    }
  }

  async atualizar(id, dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("ug", sql.VarChar, dados.ug)
        .input("maquina", sql.VarChar, dados.maquina)
        .input("pilha", sql.VarChar, dados.pilha)
        .input("inicio", sql.DateTime, dados.inicio)
        .input("fim", sql.DateTime, dados.fim)
        .input("volume", sql.Float, dados.volume)
        .input("especialidade", sql.VarChar, dados.especialidade || "OPERAÇÃO")
        .input("classificacao", sql.VarChar, dados.classificacao)
        .input("observacao", sql.VarChar, dados.observacao).query(`
        UPDATE retoma_realizada
        SET 
          ug = @ug, 
          maquina = @maquina, 
          pilha = @pilha, 
          inicio = @inicio, 
          fim = @fim, 
          volume = @volume, 
          especialidade = @especialidade, 
          classificacao = @classificacao, 
          observacao = @observacao
        WHERE id = @id
      `);

      return result;
    } catch (err) {
      console.error(`Erro ao atualizar o registro:`, err);
      throw err;
    }
  }

  async deletar(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
        DELETE FROM retoma_realizada
        WHERE id = @id
      `);

      return result;
    } catch (err) {
      console.error(`Erro ao deletar o registro:`, err);
      throw err;
    }
  }
}

module.exports = new RetomaModel();
