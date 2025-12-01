const { poolPromise, sql } = require("../infraestrutura/conexao");

const converterParaNumeroSQL = (valor) => {
  if (valor === null || valor === undefined || valor.toString().trim() === "") {
    return null;
  }
  const valorLimpo = valor.toString().replace(/\./g, "").replace(",", ".");
  return parseFloat(valorLimpo);
};

// Função auxiliar para buscar o consumo de base
const getConsumoBase = async (ug) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("ug", sql.VarChar, ug).query(`
        SELECT consumo
        FROM config_consumo
        WHERE ug = @ug AND carga = 'base';
    `);

    if (result.recordset.length > 0) {
      return parseFloat(result.recordset[0].consumo || 0);
    }
    return 0;
  } catch (err) {
    console.error(`Erro ao buscar consumo base:`, err);
    throw err;
  }
};

const reverterDadosParaArray = (dadosObjeto) => {
  const dadosArray = [];

  for (const key in dadosObjeto) {
    if (dadosObjeto.hasOwnProperty(key)) {
      const ug = key.substring(0, 3);
      let carga = key.substring(3).toLowerCase();

      if (ug.startsWith("UG") && ["base", "reduzida"].includes(carga)) {
        let consumoRaw = dadosObjeto[key];

        if (typeof consumoRaw === "string") {
          consumoRaw = consumoRaw.replace(/\./g, "");
        }
        const consumo = parseInt(consumoRaw, 10);

        if (!isNaN(consumo)) {
          dadosArray.push({ ug, carga, consumo });
        }
      }
    }
  }
  return dadosArray;
};

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
      SELECT TOP 1
        dia,
        volume_ep,
        volume_eneva,
        volume_conjunto,
        dia_ep,
        dia_eneva,
        dia_conjunto
      FROM estoque
      ORDER BY id DESC
    `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar estoque:", err);
      throw err;
    }
  }

  async consumoEmCarga(carga) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("base", sql.VarChar, carga)
        .query(`
      SELECT * FROM config_consumo WHERE carga = @base
    `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar consumo:", err);
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

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar estoque por pilha:", err);
      throw err;
    }
  }

  async listarConfig() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`SELECT * FROM config_consumo`);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Configuração:", err);
      throw err;
    }
  }

  async seExiste(data) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("dia", sql.Date, data).query(`
        SELECT dia FROM estoque
        WHERE
            dia = @dia
    `);

      return result.recordset.length > 0;
    } catch (err) {
      console.error("Erro ao buscar data:", err);
      throw err;
    }
  }

  async listarPorPilhaId(pilha) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("pilha", sql.VarChar, pilha)
        .query(`
        SELECT * FROM descarregamento_navio_pilha
        WHERE
          pilha = @pilha
          AND volume > 0
      `);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar navios por pilha:", err);
      throw err;
    }
  }

  async listarPorId(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT * FROM estoque
        WHERE
          id = @id
      `);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar estoque:", err);
      throw err;
    }
  }

  async adicionarConsumo(dados) {
    const query = `
        INSERT INTO estoque
        (dia, consumo_ug1, consumo_ug2, consumo_ug3, ajuste_ep, ajuste_eneva, tcld_ep, tcld_eneva, rodoviario_ep, rodoviario_eneva, emprestimo_ep, emprestimo_eneva, comentario, volume_ep, volume_eneva, volume_conjunto, dia_ep, dia_eneva, dia_conjunto)
        VALUES (@dia, @consumo_ug1, @consumo_ug2, @consumo_ug3, @ajuste_ep, @ajuste_eneva, @tcld_ep, @tcld_eneva, @rodoviario_ep, @rodoviario_eneva, @emprestimo_ep, @emprestimo_eneva, @comentario, @volume_ep, @volume_eneva, @volume_conjunto, @dia_ep, @dia_eneva, @dia_conjunto)
    `;
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("dia", sql.Date, dados.data)
        .input("consumo_ug1", sql.Decimal(10, 2), dados.consumo_ug1)
        .input("consumo_ug2", sql.Decimal(10, 2), dados.consumo_ug2)
        .input("consumo_ug3", sql.Decimal(10, 2), dados.consumo_ug3)
        .input("ajuste_ep", sql.Decimal(10, 2), dados.ajuste_ep)
        .input("ajuste_eneva", sql.Decimal(10, 2), dados.ajuste_eneva)
        .input("tcld_ep", sql.Decimal(10, 2), dados.tcld_ep)
        .input("tcld_eneva", sql.Decimal(10, 2), dados.tcld_eneva)
        .input("rodoviario_ep", sql.Decimal(10, 2), dados.rodoviario_ep)
        .input("rodoviario_eneva", sql.Decimal(10, 2), dados.rodoviario_eneva)
        .input("emprestimo_ep", sql.Decimal(10, 2), dados.emprestimo_ep)
        .input("emprestimo_eneva", sql.Decimal(10, 2), dados.emprestimo_eneva)
        .input("comentario", sql.VarChar, dados.comentario)
        .input("volume_ep", sql.Decimal(10, 2), dados.volume_ep)
        .input("volume_eneva", sql.Decimal(10, 2), dados.volume_eneva)
        .input("volume_conjunto", sql.Decimal(10, 2), dados.volume_conjunto)
        .input("dia_ep", sql.Int, dados.dia_ep)
        .input("dia_eneva", sql.Int, dados.dia_eneva)
        .input("dia_conjunto", sql.Int, dados.dia_conjunto)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar ocorrência:", err);
      throw err;
    }
  }

  async atualizarConfig(dados) {
    const dadosParaAtualizar = reverterDadosParaArray(dados);

    try {
      const pool = await poolPromise;
      const updatePromises = dadosParaAtualizar.map((item) => {
        const { ug, carga, consumo } = item;

        return pool
          .request()
          .input("consumo", sql.Decimal(10, 2), consumo)
          .input("ug", sql.VarChar, ug)
          .input("carga", sql.VarChar, carga).query(`
            UPDATE config_consumo 
            SET consumo = @consumo
            WHERE ug = @ug AND carga = @carga
          `);
      });

      const results = await Promise.all(updatePromises);

      return results;
    } catch (err) {
      console.error("Erro ao atualizar a configuração:", err);
      throw err;
    }
  }

  async atualizarEstoque(dados) {
    try {
      const pool = await poolPromise;
      const request = pool
        .request()
        .input("id", sql.Int, dados.id)
        .input("consumo_ug1", sql.Decimal(10, 2), dados.consumo_ug1)
        .input("consumo_ug2", sql.Decimal(10, 2), dados.consumo_ug2)
        .input("consumo_ug3", sql.Decimal(10, 2), dados.consumo_ug3)
        .input("ajuste_ep", sql.Decimal(10, 2), dados.ajuste_ep)
        .input("ajuste_eneva", sql.Decimal(10, 2), dados.ajuste_eneva)
        .input("tcld_ep", sql.Decimal(10, 2), dados.tcld_ep)
        .input("tcld_eneva", sql.Decimal(10, 2), dados.tcld_eneva)
        .input("rodoviario_ep", sql.Decimal(10, 2), dados.rodoviario_ep)
        .input("rodoviario_eneva", sql.Decimal(10, 2), dados.rodoviario_eneva)
        .input("emprestimo_ep", sql.Decimal(10, 2), dados.emprestimo_ep)
        .input("emprestimo_eneva", sql.Decimal(10, 2), dados.emprestimo_eneva)
        .input("comentario", sql.VarChar, dados.comentario || null)
        .input("volume_ep", sql.Decimal(10, 2), dados.volume_ep)
        .input("volume_eneva", sql.Decimal(10, 2), dados.volume_eneva)
        .input("volume_conjunto", sql.Decimal(10, 2), dados.volume_conjunto)
        .input("dia_ep", sql.Int, dados.dia_ep)
        .input("dia_eneva", sql.Int, dados.dia_eneva)
        .input("dia_conjunto", sql.Int, dados.dia_conjunto);

      const result = await request.query(`
                UPDATE estoque SET 
                    consumo_ug1 = @consumo_ug1,
                    consumo_ug2 = @consumo_ug2,
                    consumo_ug3 = @consumo_ug3,
                    ajuste_ep = @ajuste_ep,
                    ajuste_eneva = @ajuste_eneva,
                    tcld_ep = @tcld_ep,
                    tcld_eneva = @tcld_eneva,
                    rodoviario_ep = @rodoviario_ep,
                    rodoviario_eneva = @rodoviario_eneva,
                    emprestimo_ep = @emprestimo_ep,
                    emprestimo_eneva = @emprestimo_eneva,
                    comentario = @comentario,
                    volume_ep = @volume_ep, 
                    volume_eneva = @volume_eneva, 
                    volume_conjunto = @volume_conjunto, 
                    dia_ep = @dia_ep, 
                    dia_eneva = @dia_eneva, 
                    dia_conjunto = @dia_conjunto
                WHERE id = @id
            `);

      return result;
    } catch (err) {
      console.error("Erro ao atualizar ocorrência de estoque:", err);
      throw err;
    }
  }

  async loopAtualizaEstoque(idInicio) {
    try {
      const pool = await poolPromise;

      // busca todos os registros de 'estoque' a partir do idInicio
      const registros = (
        await pool.request().input("idInicio", sql.Int, idInicio).query(`
                SELECT *
                FROM estoque
                WHERE id >= @idInicio
                ORDER BY id ASC
            `)
      ).recordset;

      if (registros.length === 0) {
        return 0;
      }

      const consumoUG1 = await getConsumoBase("UG1");
      const consumoUG2 = await getConsumoBase("UG2");
      const consumoUG3 = await getConsumoBase("UG3");
      const consumoEP = consumoUG1 + consumoUG2;
      const consumoConjunto = consumoEP + consumoUG3;

      let volumeEP_anterior = 0;
      let volumeENEVA_anterior = 0;

      if (idInicio > 1) {
        const anteriorResult = await pool
          .request()
          .input("idAnterior", sql.Int, idInicio - 1)
          .query(
            `SELECT volume_ep, volume_eneva FROM estoque WHERE id = @idAnterior`
          );

        if (anteriorResult.recordset.length > 0) {
          volumeEP_anterior = parseFloat(anteriorResult.recordset[0].volume_ep);
          volumeENEVA_anterior = parseFloat(
            anteriorResult.recordset[0].volume_eneva
          );
        }
      }

      let atualizacoesSucesso = 0;

      for (const dados of registros) {
        const dadosAtualizados = { ...dados };

        const ajuste_ep = parseFloat(dadosAtualizados.ajuste_ep || 0);
        const tcld_ep = parseFloat(dadosAtualizados.tcld_ep || 0);
        const rodoviario_ep = parseFloat(dadosAtualizados.rodoviario_ep || 0);
        const emprestimo_ep = parseFloat(dadosAtualizados.emprestimo_ep || 0);
        const consumo_ug1 = parseFloat(dadosAtualizados.consumo_ug1 || 0);
        const consumo_ug2 = parseFloat(dadosAtualizados.consumo_ug2 || 0);

        const ajuste_eneva = parseFloat(dadosAtualizados.ajuste_eneva || 0);
        const tcld_eneva = parseFloat(dadosAtualizados.tcld_eneva || 0);
        const rodoviario_eneva = parseFloat(
          dadosAtualizados.rodoviario_eneva || 0
        );
        const emprestimo_eneva = parseFloat(
          dadosAtualizados.emprestimo_eneva || 0
        );
        const consumo_ug3 = parseFloat(dadosAtualizados.consumo_ug3 || 0);

        // CÁLCULOS
        dadosAtualizados.volume_ep =
          volumeEP_anterior +
          (ajuste_ep + tcld_ep + rodoviario_ep + emprestimo_ep) -
          (consumo_ug1 + consumo_ug2);

        dadosAtualizados.volume_eneva =
          volumeENEVA_anterior +
          (ajuste_eneva + tcld_eneva + rodoviario_eneva + emprestimo_eneva) -
          consumo_ug3;

        dadosAtualizados.volume_conjunto =
          dadosAtualizados.volume_ep + dadosAtualizados.volume_eneva;

        dadosAtualizados.dia_ep = Math.floor(
          dadosAtualizados.volume_ep / consumoEP
        );
        dadosAtualizados.dia_eneva = Math.floor(
          dadosAtualizados.volume_eneva / consumoUG3
        );
        dadosAtualizados.dia_conjunto = Math.floor(
          dadosAtualizados.volume_conjunto / consumoConjunto
        );

        await this.atualizarEstoque(dadosAtualizados);
        atualizacoesSucesso++;

        // Atualiza o volume anterior para o PRÓXIMO loop
        volumeEP_anterior = dadosAtualizados.volume_ep;
        volumeENEVA_anterior = dadosAtualizados.volume_eneva;
      }

      return atualizacoesSucesso;
    } catch (err) {
      console.error("Erro no loopAtualizaEstoque:", err);
      throw err;
    }
  }

  async atualizarPorPilha(array) {
    const { dados } = array;

    try {
      const pool = await poolPromise;
      const idsParaWhereIn = dados.map((item) => item.id).join(", ");

      const navioCases = dados
        .map((item) => {
          const navio = item.navio
            ? item.navio.toString().replace(/'/g, "''")
            : "";
          return `WHEN id = ${item.id} THEN '${navio}'`;
        })
        .join("\n    ");

      const volumeCases = dados
        .map((item) => {
          const volume = item.volume ? converterParaNumeroSQL(item.volume) : 0;
          return `WHEN id = ${item.id} THEN ${volume}`;
        })
        .join("\n    ");

      const query = `
      UPDATE descarregamento_navio_pilha
      SET
        navio = CASE
          ${navioCases}
          ELSE navio
        END,
        volume = CASE
          ${volumeCases}
          ELSE volume
        END
      WHERE 
        id IN (${idsParaWhereIn});
    `;

      const result = await pool.request().query(query);
      return result;
    } catch (err) {
      console.error("Erro ao atualizar estoque por pilha:", err);
      throw err;
    }
  }
}

module.exports = new EstoqueModel();
