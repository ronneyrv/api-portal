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
      const result = await pool
        .request()
        .input("navio", sql.VarChar, dados.navio)
        .input("cliente", sql.VarChar, dados.cliente)
        .input("atracacao1", sql.DateTime, dados.atracacao1)
        .input("inicio_op", sql.DateTime, dados.inicio_op)
        .input("arqueacao_inicial", sql.Float, dados.arqueacao_inicial)
        .input("atracado", sql.Bit, dados.atracado ?? 1)
        .input("finalizado", sql.Bit, dados.finalizado ?? 0)
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
      const result = await pool
        .request()
        .query("SELECT * FROM descarregamento_navios");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao listar Navios:", err);
      throw err;
    }
  }

  async previsaoFim() {
    try {
      const pool = await poolPromise;
      const resultado = await pool
        .request()
        .input("finalizado", sql.Bit, 0)
        .query(
          "SELECT navio, atracacao, saldo, taxa FROM descarregamento_navios WHERE finalizado = @finalizado"
        );

      if (resultado.recordset.length === 0) {
        return false;
      }

      const navio = resultado.recordset[0];
      const atracacao = new Date(navio.atracacao);
      const agora = new Date();
      const diferencaMsegundos = agora - atracacao;
      const diferencaDias = diferencaMsegundos / (1000 * 60 * 60 * 24);
      const diasCalculado = diferencaDias + navio.saldo / navio.taxa;

      await pool
        .request()
        .input("dias", sql.Decimal(5, 2), diasCalculado)
        .input("navio", sql.VarChar, navio.navio)
        .query(
          "UPDATE descarregamento_navios SET dias = @dias WHERE navio = @navio"
        );

      return true;
    } catch (err) {
      console.error("Erro ao atualizar previsão:", err);
      throw err;
    }
  }

  async pilhas() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM descarregamento_navio_pilha WHERE volume > 0");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar pilhas:", err);
      throw err;
    }
  }

  async buscarNavioAtracado() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("finalizado", sql.Bit, 0)
        .query(
          "SELECT * FROM descarregamento_navios WHERE finalizado = @finalizado"
        );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Navio:", err);
      throw err;
    }
  }

  async ocorrenciasNavioAtracado(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, id)
        .query(
          "SELECT * FROM descarregamento_ocorrencias WHERE navio = @navio ORDER BY id DESC"
        );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Navio:", err);
      throw err;
    }
  }

  async buscarOcorrencia(id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM descarregamento_ocorrencias WHERE id = @id");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar ocorrência:", err);
      throw err;
    }
  }

  async atualizarOcorrenciaSimples(dados, id) {
    const query = `
    UPDATE descarregamento_ocorrencias
    SET 
      ocorrencia = @ocorrencia,
      resumo = @resumo,
      sistema = @sistema,
      subsistema = @subsistema,
      classificacao = @classificacao,
      especialidade = @especialidade,
      tipo_desligamento = @tipo_desligamento
    WHERE id = @id
  `;

    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("ocorrencia", sql.VarChar, dados.ocorrencia)
        .input("resumo", sql.VarChar, dados.resumo)
        .input("sistema", sql.VarChar, dados.sistema)
        .input("subsistema", sql.VarChar, dados.subsistema)
        .input("classificacao", sql.VarChar, dados.classificacao)
        .input("especialidade", sql.VarChar, dados.especialidade)
        .input("tipo_desligamento", sql.VarChar, dados.tipo_desligamento)
        .input("id", sql.Int, id)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao atualizar ocorrência:", err);
      throw err;
    }
  }

  async paretoOperacao(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, id)
        .query(`
        SELECT 
          resumo,
          SUM(tempo) AS tempo_total
        FROM descarregamento_ocorrencias
        WHERE 
          navio = @navio 
          AND especialidade = 'OPERAÇÃO'
          AND resumo <> 'DESCARREGANDO'
        GROUP BY resumo
        ORDER BY tempo_total DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Pareto OPERAÇÃO:", err);
      throw err;
    }
  }

  async paretoManutencao(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, id)
        .query(`
        SELECT 
          resumo,
          SUM(tempo) AS tempo_total
        FROM descarregamento_ocorrencias
        WHERE 
          navio = @navio
          AND especialidade IN ('MAN ELÉTRICA', 'MAN MECÂNICA', 'ENGENHARIA')
        GROUP BY resumo
        ORDER BY tempo_total DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Pareto MANUTENÇÃO:", err);
      throw err;
    }
  }

  async cascataEventos(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, id)
        .query(`
        SELECT classificacao, SUM(tempo) AS tempo_total
        FROM descarregamento_ocorrencias
        WHERE navio = @navio
          AND classificacao IN (
            'CONDIÇÃO CLIMÁTICA',
            'DESCARREGANDO',
            'MANUTENÇÃO CORRETIVA',
            'MANUTENÇÃO PREVENTIVA',
            'PARADA OPERACIONAL'
          )
        GROUP BY classificacao
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar eventos resumo:", err);
      throw err;
    }
  }

  async corretivPreventiva(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, id)
        .query(`
        SELECT sistema, classificacao, SUM(tempo) AS tempo
        FROM descarregamento_ocorrencias
        WHERE navio = @navio
          AND classificacao IN ('MANUTENÇÃO CORRETIVA', 'MANUTENÇÃO PREVENTIVA')
        GROUP BY sistema, classificacao
      `);

      const dados = result.recordset;

      const mapa = {};

      dados.forEach(({ sistema, classificacao, tempo }) => {
        if (!mapa[sistema]) {
          mapa[sistema] = { nome: sistema, corretiva: 0, preventiva: 0 };
        }
        if (classificacao === "MANUTENÇÃO CORRETIVA") {
          mapa[sistema].corretiva = Number(tempo);
        } else if (classificacao === "MANUTENÇÃO PREVENTIVA") {
          mapa[sistema].preventiva = Number(tempo);
        }
      });

      return Object.values(mapa);
    } catch (err) {
      console.error("Erro ao buscar dados de manutenção:", err);
      throw err;
    }
  }
}

module.exports = new NavioModel();
