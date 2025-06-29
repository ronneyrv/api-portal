const { poolPromise, sql } = require("../infraestrutura/conexao");

class NavioModel {
  async adicionar(dados) {
    const query = `
      INSERT INTO descarregamento_navios
      (navio, cliente, atracacao1, inicio_op, arqueacao_inicial, atracado, finalizado)
      VALUES (@navio, @cliente, @atracacao1, @inicio_op, @arqueacao_inicial, @atracado, @finalizado)
    `;

    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('navio', sql.VarChar, dados.navio)
        .input('cliente', sql.VarChar, dados.cliente)
        .input('atracacao1', sql.DateTime, dados.atracacao1)
        .input('inicio_op', sql.DateTime, dados.inicio_op)
        .input('arqueacao_inicial', sql.Float, dados.arqueacao_inicial)
        .input('atracado', sql.Bit, dados.atracado ?? 1)
        .input('finalizado', sql.Bit, dados.finalizado ?? 0)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar navio:", err);
      throw err;
    }
  }

  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM descarregamento_navios");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao listar Navios:", err);
      throw err;
    }
  }

  async buscar() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("finalizado", sql.Bit, 0)
        .query("SELECT * FROM descarregamento_navios WHERE finalizado = @finalizado");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Navios:", err);
      throw err;
    }
  }

  async listarNavio(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("navio", sql.VarChar, id)
        .query("SELECT * FROM descarregamento_navios WHERE navio = @navio");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Navio:", err);
      throw err;
    }
  }

  async atualizar(dados, id) {
    const query = `
      UPDATE timepptm
      SET nome = @nome, funcao = @funcao, cargo = @cargo, setor = @setor,
          equipe = @equipe, gestor = @gestor, email = @email, ativo = @ativo
      WHERE id = @id
    `;

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
        .input("id", sql.Int, id)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao atualizar navio:", err);
      throw err;
    }
  }

  async pilhas() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(
        "SELECT * FROM descarregamento_navio_pilha WHERE volume > 0"
      );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar pilhas:", err);
      throw err;
    }
  }
}

module.exports = new NavioModel();
