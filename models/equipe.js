const { poolPromise, sql } = require("../infraestrutura/conexao");

class equipeModel {
  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM timepptm");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao listar equipe:", err);
      throw err;
    }
  }

  async criar(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("nome", sql.VarChar, dados.nome)
        .input("funcao", sql.VarChar, dados.funcao)
        .input("cargo", sql.VarChar, dados.cargo)
        .input("setor", sql.VarChar, dados.setor)
        .input("equipe", sql.VarChar, dados.equipe)
        .input("gestor", sql.VarChar, dados.gestor)
        .input("email", sql.VarChar, dados.email)
        .input("ativo", sql.Bit, dados.ativo)
        .query(`
          INSERT INTO timepptm (nome, funcao, cargo, setor, equipe, gestor, email, ativo)
          VALUES (@nome, @funcao, @cargo, @setor, @equipe, @gestor, @email, @ativo)
        `);
      return result;
    } catch (err) {
      console.error("Erro ao adicionar colaborador:", err);
      throw err;
    }
  }

  async atualizar(dados, id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("id", sql.Int, id)
        .input("nome", sql.VarChar, dados.nome)
        .input("funcao", sql.VarChar, dados.funcao)
        .input("cargo", sql.VarChar, dados.cargo)
        .input("setor", sql.VarChar, dados.setor)
        .input("equipe", sql.VarChar, dados.equipe)
        .input("gestor", sql.VarChar, dados.gestor)
        .input("email", sql.VarChar, dados.email)
        .input("ativo", sql.Bit, dados.ativo)
        .query(`
          UPDATE timepptm
          SET nome = @nome,
              funcao = @funcao,
              cargo = @cargo,
              setor = @setor,
              equipe = @equipe,
              gestor = @gestor,
              email = @email,
              ativo = @ativo
          WHERE id = @id
        `);
      return result;
    } catch (err) {
      console.error("Erro ao atualizar colaborador:", err);
      throw err;
    }
  }
}

module.exports = new equipeModel();
