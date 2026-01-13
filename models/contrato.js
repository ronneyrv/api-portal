const { poolPromise, sql } = require("../infraestrutura/conexao");

class ContratoModel {
  async listar() {
    try {
      const pool = await poolPromise;
      const query = `
        UPDATE contrato_contratos
        SET status_vigencia = CASE
            WHEN DATEDIFF(DAY, GETDATE(), vigencia) < 1 THEN 'VENCIDO'   -- Menor que 1 dia
            WHEN DATEDIFF(DAY, GETDATE(), vigencia) <= 90 THEN 'CRÍTICO'  -- Menor ou igual a 3 meses
            WHEN DATEDIFF(DAY, GETDATE(), vigencia) <= 180 THEN 'ATENÇÃO' -- Menor ou igual a 6 meses
            ELSE 'OK'                                                     -- Maior que 6 meses
        END
        WHERE status_contrato = 1;

        UPDATE contrato_contratos
        SET status_reajuste = CASE
            WHEN DATEDIFF(DAY, GETDATE(), reajuste) < 1 THEN 'VENCIDO'   -- Menor que 1 dia
            WHEN DATEDIFF(DAY, GETDATE(), reajuste) <= 30 THEN 'CRÍTICO'  -- Igual a 1 mês 
            WHEN DATEDIFF(DAY, GETDATE(), reajuste) <= 90 THEN 'ATENÇÃO'  -- Menor ou igual a 3 meses
            ELSE 'OK'                                                     -- Maior que 3 meses
        END
        WHERE status_contrato = 1;

        SELECT * FROM contrato_contratos 
        WHERE status_contrato = 1;
      `;

      const result = await pool.request().query(query);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao listar e atualizar Contratos:", err);
      throw err;
    }
  }

  async orcamentoAnual() {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT * FROM contrato_orcamento_pptm;
      `;

      const result = await pool.request().query(query);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar orçamento anual:", err);
      throw err;
    }
  }

  async infoPainel(contrato) {
    try {
      const pool = await poolPromise;
      const request = pool.request().input("contrato", sql.VarChar, contrato);

      const contratoRes = await request.query(`
        SELECT 
          valor_contrato as previsto_contratado, tipo
        FROM contrato_contratos 
        WHERE contrato = @contrato
      `);

      const medicoesRes = await request.query(`
        SELECT ano, mes, valor
        FROM contrato_medicao 
        WHERE contrato = @contrato
      `);

      const acumuladoRes = await request.query(`
        SELECT TOP 1 orcado, realizado, ano 
        FROM contrato_orcamento_pptm
      `);

      const orcamentoRes = await request.query(`
        SELECT ano, mes, orcado 
        FROM contrato_orcamento 
        WHERE contrato = @contrato
        ORDER BY ano, mes
      `);

      return {
        contratoInfo: contratoRes.recordset[0],
        medicoes: medicoesRes.recordset,
        acumulado: acumuladoRes.recordset[0],
        orcamentos: orcamentoRes.recordset,
      };
    } catch (err) {
      console.error("Erro ao buscar informações no Model:", err);
      throw err;
    }
  }

  async listarMedicoes(ano) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("ano", sql.Int, ano).query(`
          SELECT * FROM contrato_medicao WHERE ano = @ano
        `);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao listar medições:", err);
      throw err;
    }
  }

  async previsaoContrato(ano, contrato) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("ano", sql.Int, ano)
        .input("contrato", sql.VarChar, contrato).query(`
          SELECT 
            c.contrato, 
            c.fornecedor, 
            c.vigencia, 
            c.valor_contrato,

            -- tratando nulo do plano orçamentário
            ISNULL(m.plano_orcamentario, '') as plano_orcamentario,
            
            -- Total das medições
            (SELECT ISNULL(SUM(valor), 0) FROM contrato_medicao WHERE contrato = c.contrato) AS valor_medido_contrato,
            (c.valor_contrato - (SELECT ISNULL(SUM(valor), 0) FROM contrato_medicao WHERE contrato = c.contrato)) AS valor_saldo,

            -- Coluna REALIZADO 
            ISNULL(m.realizado_1, 0) as realizado_1,
            ISNULL(m.realizado_2, 0) as realizado_2,
            ISNULL(m.realizado_3, 0) as realizado_3,
            ISNULL(m.realizado_4, 0) as realizado_4,
            ISNULL(m.realizado_5, 0) as realizado_5,
            ISNULL(m.realizado_6, 0) as realizado_6,
            ISNULL(m.realizado_7, 0) as realizado_7,
            ISNULL(m.realizado_8, 0) as realizado_8,
            ISNULL(m.realizado_9, 0) as realizado_9,
            ISNULL(m.realizado_10, 0) as realizado_10,
            ISNULL(m.realizado_11, 0) as realizado_11,
            ISNULL(m.realizado_12, 0) as realizado_12,
            ISNULL(m.total_medido_ano, 0) as valor_medido_ano,

            -- Coluna ORCADO 
            ISNULL(p.orcado_1, 0) as orcado_1,
            ISNULL(p.orcado_2, 0) as orcado_2,
            ISNULL(p.orcado_3, 0) as orcado_3,
            ISNULL(p.orcado_4, 0) as orcado_4,
            ISNULL(p.orcado_5, 0) as orcado_5,
            ISNULL(p.orcado_6, 0) as orcado_6,
            ISNULL(p.orcado_7, 0) as orcado_7,
            ISNULL(p.orcado_8, 0) as orcado_8,
            ISNULL(p.orcado_9, 0) as orcado_9,
            ISNULL(p.orcado_10, 0) as orcado_10,
            ISNULL(p.orcado_11, 0) as orcado_11,
            ISNULL(p.orcado_12, 0) as orcado_12,
            ISNULL(p.total_orcado_ano, 0) as valor_orcado_ano

          FROM contrato_contratos c
          
          -- 1. JOIN COM MEDIÇÃO
          LEFT JOIN (
            SELECT 
                contrato,
                MAX(plano_orcamentario) as plano_orcamentario,
                SUM(CASE WHEN mes = 1 THEN valor ELSE 0 END) AS realizado_1,
                SUM(CASE WHEN mes = 2 THEN valor ELSE 0 END) AS realizado_2,
                SUM(CASE WHEN mes = 3 THEN valor ELSE 0 END) AS realizado_3,
                SUM(CASE WHEN mes = 4 THEN valor ELSE 0 END) AS realizado_4,
                SUM(CASE WHEN mes = 5 THEN valor ELSE 0 END) AS realizado_5,
                SUM(CASE WHEN mes = 6 THEN valor ELSE 0 END) AS realizado_6,
                SUM(CASE WHEN mes = 7 THEN valor ELSE 0 END) AS realizado_7,
                SUM(CASE WHEN mes = 8 THEN valor ELSE 0 END) AS realizado_8,
                SUM(CASE WHEN mes = 9 THEN valor ELSE 0 END) AS realizado_9,
                SUM(CASE WHEN mes = 10 THEN valor ELSE 0 END) AS realizado_10,
                SUM(CASE WHEN mes = 11 THEN valor ELSE 0 END) AS realizado_11,
                SUM(CASE WHEN mes = 12 THEN valor ELSE 0 END) AS realizado_12,
                SUM(valor) as total_medido_ano
            FROM contrato_medicao 
            WHERE ano = @ano 
            GROUP BY contrato
          ) m ON c.contrato = m.contrato

          -- 2. JOIN COM ORÇAMENTO
          LEFT JOIN (
            SELECT 
                contrato,
                SUM(CASE WHEN mes = 1 THEN orcado ELSE 0 END) AS orcado_1,
                SUM(CASE WHEN mes = 2 THEN orcado ELSE 0 END) AS orcado_2,
                SUM(CASE WHEN mes = 3 THEN orcado ELSE 0 END) AS orcado_3,
                SUM(CASE WHEN mes = 4 THEN orcado ELSE 0 END) AS orcado_4,
                SUM(CASE WHEN mes = 5 THEN orcado ELSE 0 END) AS orcado_5,
                SUM(CASE WHEN mes = 6 THEN orcado ELSE 0 END) AS orcado_6,
                SUM(CASE WHEN mes = 7 THEN orcado ELSE 0 END) AS orcado_7,
                SUM(CASE WHEN mes = 8 THEN orcado ELSE 0 END) AS orcado_8,
                SUM(CASE WHEN mes = 9 THEN orcado ELSE 0 END) AS orcado_9,
                SUM(CASE WHEN mes = 10 THEN orcado ELSE 0 END) AS orcado_10,
                SUM(CASE WHEN mes = 11 THEN orcado ELSE 0 END) AS orcado_11,
                SUM(CASE WHEN mes = 12 THEN orcado ELSE 0 END) AS orcado_12,
                SUM(orcado) as total_orcado_ano
            FROM contrato_orcamento 
            WHERE ano = @ano 
            GROUP BY contrato
          ) p ON c.contrato = p.contrato
          
          WHERE c.contrato = @contrato
        `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar previsão de contrato:", err);
      throw err;
    }
  }

  async contrato(status, tipo) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("status", sql.Int, status)
        .input("tipo", sql.VarChar, tipo).query(`
          SELECT * FROM contrato_contratos 
          WHERE status_contrato = @status
          AND tipo = @tipo;
        `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar fornecedores:", err);
      throw err;
    }
  }

  async adicionar(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("contrato", sql.VarChar, dados.contrato)
        .input("fornecedor", sql.VarChar, dados.fornecedor)
        .input("tipo", sql.VarChar, dados.tipo)
        .input("inicio", sql.Date, dados.inicio)
        .input("vigencia", sql.Date, dados.vigencia)
        .input("reajuste", sql.Date, dados.reajuste || null)
        .input("tarifa", sql.VarChar, dados.tarifa)
        .input("valor_contrato", sql.Float, dados.valor_contrato)
        .input("status_vigencia", sql.VarChar, dados.status_vigencia)
        .input("status_reajuste", sql.VarChar, dados.status_reajuste)
        .input("status_contrato", sql.Bit, dados.status_contrato).query(`
          INSERT INTO contrato_contratos
          (contrato, fornecedor, tipo, inicio, vigencia, reajuste, tarifa, valor_contrato, status_vigencia, status_reajuste, status_contrato)
          VALUES (@contrato, @fornecedor, @tipo, @inicio, @vigencia, @reajuste, @tarifa, @valor_contrato, @status_vigencia, @status_reajuste, @status_contrato)
        `);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      s;
      throw err;
    }
  }

  async medicao(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("contrato", sql.VarChar, dados.contrato)
        .input("fornecedor", sql.VarChar, dados.fornecedor)
        .input("descricao", sql.VarChar, dados.descricao)
        .input("valor", sql.Float, dados.valor)
        .input("centro_custo", sql.VarChar, dados.centro_custo)
        .input("medicao", sql.VarChar, dados.medicao)
        .input("pedido", sql.VarChar, dados.pedido)
        .input("frs_migo", sql.VarChar, dados.frs_migo)
        .input("plano_orcamentario", sql.VarChar, dados.plano_orcamentario)
        .input("status_medicao", sql.VarChar, dados.status_medicao)
        .input("mes", sql.Int, dados.mes)
        .input("ano", sql.Int, dados.ano).query(`
          INSERT INTO contrato_medicao
          (contrato, fornecedor, descricao, valor, centro_custo, medicao, pedido, frs_migo, plano_orcamentario, status_medicao, mes, ano)
          VALUES (@contrato, @fornecedor, @descricao, @valor, @centro_custo, @medicao, @pedido, @frs_migo, @plano_orcamentario, @status_medicao, @mes, @ano)
        `);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar medição:", err);
      throw err;
    }
  }

  async provisao(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("mes", sql.Int, dados.mes)
        .input("ano", sql.Int, dados.ano)
        .input("contrato", sql.VarChar, dados.contrato)
        .input("orcado", sql.Float, dados.orcado || 0)
        .input("realizado", sql.Float, dados.realizado || 0)
        .input("fornecedor", sql.VarChar, dados.fornecedor).query(`
          IF EXISTS (SELECT 1 FROM contrato_orcamento WHERE mes = @mes AND ano = @ano AND contrato = @contrato)
          BEGIN
            UPDATE contrato_orcamento
            SET 
                orcado = @orcado, 
                realizado = @realizado
            WHERE mes = @mes AND ano = @ano AND contrato = @contrato
          END
          ELSE
          BEGIN
            INSERT INTO contrato_orcamento (mes, ano, orcado, realizado, contrato, fornecedor)
            VALUES (@mes, @ano, @orcado, @realizado, @contrato, @fornecedor)
          END
        `);

      return result;
    } catch (err) {
      console.error(
        `Erro ao salvar orçamento (Mês: ${dados.mes}, Ano: ${dados.ano}):`,
        err
      );
      throw err;
    }
  }

  async atualizar(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, dados.id)
        .input("fornecedor", sql.VarChar, dados.fornecedor)
        .input("tipo", sql.VarChar, dados.tipo)
        .input("inicio", sql.Date, dados.inicio)
        .input("vigencia", sql.Date, dados.vigencia)
        .input("tarifa", sql.VarChar, dados.tarifa)
        .input("valor_contrato", sql.Float, dados.valor_contrato).query(`
          UPDATE contrato_contratos
          SET 
            fornecedor = @fornecedor, 
            tipo = @tipo, 
            inicio = @inicio, 
            vigencia = @vigencia, 
            tarifa = @tarifa,
            valor_contrato = @valor_contrato
          WHERE id = @id
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao atualizar o contrato:`, err);
      throw err;
    }
  }

  async atualizarMedicao(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, dados.id)
        .input("medicao", sql.VarChar, dados.medicao)
        .input("pedido", sql.VarChar, dados.pedido)
        .input("centro_custo", sql.VarChar, dados.centro_custo)
        .input("descricao", sql.VarChar, dados.descricao)
        .input("valor", sql.Float, dados.valor)
        .input("plano_orcamentario", sql.VarChar, dados.plano_orcamentario)
        .query(`
          UPDATE contrato_medicao
          SET 
            medicao = @medicao, 
            pedido = @pedido, 
            centro_custo = @centro_custo,
            descricao = @descricao,
            valor = @valor,
            plano_orcamentario = @plano_orcamentario
          WHERE id = @id
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao atualizar a medição:`, err);
      throw err;
    }
  }

  async atualizarMedicaoStatus(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, dados.id)
        .input("status_medicao", sql.VarChar, dados.status_medicao).query(`
          UPDATE contrato_medicao
          SET 
            status_medicao = @status_medicao
          WHERE id = @id
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao atualizar o status da medição:`, err);
      throw err;
    }
  }

  async atualizarOrcamentoAnual(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, 1)
        .input("ano", sql.VarChar, dados.ano)
        .input("orcado", sql.Float, dados.orcado)
        .input("realizado", sql.Float, dados.realizado).query(`
          UPDATE contrato_orcamento_pptm
          SET 
            ano = @ano,
            orcado = @orcado,
            realizado = @realizado
          WHERE id = @id
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao atualizar orçamento:`, err);
      throw err;
    }
  }

  async encerrar(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, dados.id)
        .input("status_contrato", sql.Bit, 0).query(`
          UPDATE contrato_contratos
          SET 
            status_contrato = @status_contrato
          WHERE id = @id
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao encerrar o contrato:`, err);
      throw err;
    }
  }

  async reajuste(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, dados.id)
        .input("reajuste", sql.Date, dados.novo_reajuste)
        .input("tarifa", sql.VarChar, dados.tarifa).query(`
          UPDATE contrato_contratos
          SET 
            reajuste = @reajuste,
            tarifa = @tarifa
          WHERE id = @id
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao alterar a data de reajuste:`, err);
      throw err;
    }
  }
}

module.exports = new ContratoModel();
