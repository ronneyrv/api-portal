const { poolPromise, sql } = require("../infraestrutura/conexao");

class PolimeroModel {
  async condicao() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM polimero_status");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao verificar a condição do polímero:", err);
      throw err;
    }
  }

  async volume() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM polimero_volume");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao verificar o volume de polímero:", err);
      throw err;
    }
  }

  async lista() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM polimero_aplicacoes");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao verificar a lista de polímero:", err);
      throw err;
    }
  }

  async buscarPorId(id_aplicacao) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id_aplicacao", sql.Int, id_aplicacao).query(`
            SELECT * FROM polimero_aplicacoes 
            WHERE id_aplicacao = @id_aplicacao
        `);

      return result.recordset[0] || null;
    } catch (err) {
      console.error("Erro ao buscar registro por ID:", err);
      throw err;
    }
  }

  async pilhaVazia() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT * FROM polimero_status;
      `);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar pilhas:", err);
      throw err;
    }
  }

  async adicionarComTransacao(dados, cliente) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    let volumeDelta = dados.volume;
    if (dados.tipo === "SAIDA") {
      volumeDelta = -dados.volume;
    }

    await transaction.begin();
    try {
      let request = transaction.request();
      request
        .input("data", sql.Date, dados.data)
        .input("tipo", sql.VarChar, dados.tipo)
        .input("pilha", sql.VarChar, dados.pilha)
        .input("volume", sql.Float, dados.volume)
        .input("responsavel", sql.VarChar, dados.responsavel)
        .input("observacao", sql.VarChar, dados.observacao);

      await request.query(`
        INSERT INTO polimero_aplicacoes
        (data, tipo, pilha, volume, responsavel, observacao)
        VALUES (@data, @tipo, @pilha, @volume, @responsavel, @observacao)
      `);

      await transaction
        .request()
        .input("cliente", sql.VarChar, cliente)
        .input("volumeDelta", sql.Float, volumeDelta).query(`
          UPDATE polimero_volume
          SET volume = volume + @volumeDelta 
          WHERE cliente = @cliente
        `);

      if (dados.tipo === "SAIDA") {
        await transaction
          .request()
          .input("data", sql.Date, dados.data)
          .input("pilha", sql.VarChar, dados.pilha).query(`
            UPDATE polimero_status SET data = @data WHERE pilha = @pilha
          `);
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      console.error("Erro na transação de adição:", err);
      throw new Error(`Transação de adição falhou: ${err.message}`);
    }
  }

  async atualizarComTransacao(
    id,
    dadosNovos,
    dadosAntigos,
    clienteAntigo,
    clienteNovo
  ) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      let deltaCompensacao = dadosAntigos.volume;
      if (dadosAntigos.tipo === "ENTRADA") {
        deltaCompensacao = -dadosAntigos.volume;
      }

      let deltaNovo = dadosNovos.volume;
      if (dadosNovos.tipo === "SAIDA") {
        deltaNovo = -dadosNovos.volume;
      }

      await transaction
        .request()
        .input("clienteAntigo", sql.VarChar, clienteAntigo)
        .input("deltaCompensacao", sql.Float, deltaCompensacao).query(`
          UPDATE polimero_volume
          SET volume = volume + @deltaCompensacao 
          WHERE cliente = @clienteAntigo
        `);

      await transaction
        .request()
        .input("clienteNovo", sql.VarChar, clienteNovo)
        .input("deltaNovo", sql.Float, deltaNovo).query(`
          UPDATE polimero_volume
          SET volume = volume + @deltaNovo
          WHERE cliente = @clienteNovo
        `);

      let request = transaction.request();
      request
        .input("id_aplicacao", sql.Int, id)
        .input("data", sql.Date, dadosNovos.data)
        .input("tipo", sql.VarChar, dadosNovos.tipo)
        .input("pilha", sql.VarChar, dadosNovos.pilha)
        .input("volume", sql.Float, dadosNovos.volume)
        .input("responsavel", sql.VarChar, dadosNovos.responsavel)
        .input("observacao", sql.VarChar, dadosNovos.observacao);

      const result = await request.query(`
        UPDATE polimero_aplicacoes
        SET 
          data = @data, 
          tipo = @tipo, 
          pilha = @pilha, 
          volume = @volume, 
          responsavel= @responsavel,
          observacao = @observacao
        WHERE id_aplicacao = @id_aplicacao
      `);

      if (dadosNovos.tipo === "SAIDA") {
        await transaction
          .request()
          .input("data", sql.Date, dadosNovos.data)
          .input("pilha", sql.VarChar, dadosNovos.pilha).query(`
            UPDATE polimero_status SET data = @data WHERE pilha = @pilha
          `);
      }

      await transaction.commit();
      return result;
    } catch (err) {
      await transaction.rollback();
      console.error("Erro na transação de atualização:", err);
      throw new Error(`Transação de atualização falhou: ${err.message}`);
    }
  }

    async atualizaPilhaVazia(pilha) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("pilha", sql.VarChar, pilha).query(`
          UPDATE polimero_status SET data = null WHERE pilha = @pilha
        `);

      return result;
    } catch (err) {
      console.error("Erro ao zerar pilha:", err);
      throw err;
    }
  }

}

module.exports = new PolimeroModel();
