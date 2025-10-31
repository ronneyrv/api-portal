const { poolPromise } = require("../infraestrutura/conexao");

class EstoqueModel {
  async buscarTodos() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT * FROM estoque ORDER BY id DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar estoques:", err);
      throw err;
    }
  }

  async buscarDiario() {
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

  async buscarRealizado() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        dia,
        volume_ep,
        volume_eneva,
        volume_conjunto,
        dia_ep,
        dia_eneva,
        dia_conjunto
      FROM estoque
      ORDER BY id ASC
    `);
    return result.recordset;
  } catch (err) {
    console.error("Erro ao buscar estoques:", err);
    throw err;
  }
}


async listarPorPilha() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT
          pilha,
          SUM(volume) AS volume_total,
          cliente 
        FROM 
          descarregamento_navio_pilha
        WHERE
          pilha IN ('1A', '1B', '2A', '2B', '2C', '2D', '3A', '3B')
        GROUP BY 
          pilha, cliente
        ORDER BY
          pilha;
      `);
      
      // O resultado virá como: [{ pilha: '1A', volume_total: 3285, cliente: 'eneva' }, ...]
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar estoque por pilha:", err);
      throw err;
    }
}

  async buscarUltimo() {
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
