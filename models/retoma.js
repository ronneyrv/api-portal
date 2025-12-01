const { poolPromise, sql } = require("../infraestrutura/conexao");

class RetomaModel {
  async listarTudo() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM retoma_realizada ORDER BY inicio ASC");

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar lista:", err);
      throw err;
    }
  }

  async listarMetaTaxa() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`SELECT * FROM retoma_metas`);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Configuração:", err);
      throw err;
    }
  }

  async listarTaxa(ano) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("ano", sql.VarChar, ano).query(`
            SELECT
                m.mes,
                ISNULL(c.taxa, 0) AS taxa
            FROM
                (
                    VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11), (12)
                ) AS m(mes)
            LEFT JOIN
                (
                    SELECT
                        DATEPART(MONTH, [data]) AS mes,
                        CAST(
                            (SUM(volume) * 1.0 / NULLIF(SUM(DATEDIFF(MINUTE, inicio, fim)), 0)) * 60
                        AS INT) AS taxa
                    FROM
                        retoma_realizada
                    WHERE
                        DATEPART(YEAR, [data]) = @ano
                        AND classificacao = 'RETOMA'
                    GROUP BY
                        DATEPART(MONTH, [data])
                ) AS c ON m.mes = c.mes
            ORDER BY
                m.mes;
        `);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Taxa por Ano:", err);
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

  async decrementoNavioPilha(dados) {
    let saldoDescarregado = dados.volume;

    try {
      const pool = await poolPromise;
      const { pilha } = dados;

      const search = await pool.request().input("pilha", sql.VarChar, pilha)
        .query(`
            SELECT id, volume 
            FROM descarregamento_navio_pilha
            WHERE
              pilha = @pilha
              AND volume > 0 
            ORDER BY id DESC;
        `);
      const registros = search.recordset;
      if (registros.length === 0) return false;

      for (const registro of registros) {
        if (saldoDescarregado <= 0) {
          break;
        }

        const idRegistro = registro.id;
        const volumeAtual = parseFloat(registro.volume);

        let volumeADecrementar;
        let novoVolume;

        if (saldoDescarregado >= volumeAtual) {
          volumeADecrementar = volumeAtual;
          novoVolume = 0;
          saldoDescarregado -= volumeAtual;
        } else {
          volumeADecrementar = saldoDescarregado;
          novoVolume = volumeAtual - saldoDescarregado;
          saldoDescarregado = 0;
        }

        await pool
          .request()
          .input("id", sql.Int, idRegistro)
          .input("novoVolume", sql.Decimal(9, 2), novoVolume).query(`
              UPDATE descarregamento_navio_pilha
              SET
                volume = @novoVolume
              WHERE
                id = @id;
          `);
      }

      return true;
    } catch (err) {
      console.error("Erro ao atualizar o estoque por pilha:", err);
      throw err;
    }
  }

  async updateEstoqueNavioPilha(dados) {
    const { pilha, volume, volumeVelho } = dados;
    const delta = volume - volumeVelho;
    let saldoDescarregado = 0;

    if (delta === 0) {
      return true;
    }

    try {
      const pool = await poolPromise;
      if (delta < 0) {
        const valorRetornado = Math.abs(delta);

        await pool
          .request()
          .input("pilha", sql.VarChar, pilha)
          .input("delta", sql.Decimal(9, 2), valorRetornado).query(`
            UPDATE descarregamento_navio_pilha
            SET
              volume = volume + @delta
            WHERE
              pilha = @pilha
            AND id = (
              SELECT TOP 1 id 
              FROM descarregamento_navio_pilha 
              WHERE pilha = @pilha 
              ORDER BY id DESC
            );
          `);
        return true;
      }

      if (delta > 0) {
        let saldoDescarregado = delta;

        const search = await pool.request().input("pilha", sql.VarChar, pilha)
          .query(`
            SELECT id, volume 
            FROM descarregamento_navio_pilha
            WHERE
              pilha = @pilha
              AND volume > 0 
            ORDER BY id DESC;
          `);

        const registros = search.recordset;
        if (registros.length === 0) {
          throw new Error("Pilha sem volume ativo para realizar o decremento.");
        }

        for (const registro of registros) {
          if (saldoDescarregado <= 0) {
            break;
          }

          const idRegistro = registro.id;
          const volumeAtual = parseFloat(registro.volume);

          let novoVolume;

          if (saldoDescarregado >= volumeAtual) {
            novoVolume = 0;
            saldoDescarregado -= volumeAtual;
          } else {
            novoVolume = volumeAtual - saldoDescarregado;
            saldoDescarregado = 0;
          }

          await pool
            .request()
            .input("id", sql.Int, idRegistro)
            .input("novoVolume", sql.Decimal(9, 2), novoVolume).query(`
              UPDATE descarregamento_navio_pilha
              SET
                volume = @novoVolume
              WHERE
                id = @id;
            `);
        }

        return true;
      }
    } catch (err) {
      console.error("Erro ao atualizar estoque da pilha (UPDATE):", err);
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

  async deleteEstoqueNavioPilha(id) {
    try {
      const pool = await poolPromise;

      const retomaRecord = await pool.request().input("id", sql.Int, id).query(`
        SELECT pilha, volume
        FROM retoma_realizada
        WHERE id = @id;
      `);

      const dadosRetoma = retomaRecord.recordset[0];
      const volumeARetornar = parseFloat(dadosRetoma.volume) || 0;
      const pilha = dadosRetoma.pilha;

      if (volumeARetornar > 0) {
        await pool
          .request()
          .input("pilha", sql.VarChar, pilha)
          .input("volumeARetornar", sql.Decimal(9, 2), volumeARetornar).query(`
            UPDATE descarregamento_navio_pilha
            SET
              volume = volume + @volumeARetornar
            WHERE
              pilha = @pilha
            AND id = (
                SELECT TOP 1 id 
                FROM descarregamento_navio_pilha 
                WHERE pilha = @pilha 
                ORDER BY id DESC
            );
          `);

        return true;
      }

      return true;
    } catch (err) {
      console.error(`Erro ao retornar volume da retoma para a pilha:`, err);
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

  async atualizarMetaTaxa(dados) {
    try {
      const pool = await poolPromise;
      const arrayDados = Object.entries(dados);

      const updateMeta = arrayDados.map(([meta, valor]) => {
        return pool
          .request()
          .input("meta", sql.VarChar, meta)
          .input("valor", sql.VarChar, valor).query(`
          UPDATE retoma_metas 
          SET valor = @valor
          WHERE meta = @meta
        `);
      });

      const results = await Promise.all(updateMeta);
      return results;
    } catch (err) {
      console.error("Erro ao atualizar a Meta da Taxa:", err);
      throw err;
    }
  }
}

module.exports = new RetomaModel();
