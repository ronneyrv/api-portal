const { poolPromise, sql } = require("../infraestrutura/conexao");

class TopModel {
  async listarTarifas() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT trimestre, tarifa FROM take_or_pay_valores
      `);

      return result.recordset;
    } catch (err) {
      console.error("Erro ao listar tarifas:", err);
      throw err;
    }
  }

  async listarCompleto(ano) {
    try {
      const pool = await poolPromise;
      const volumes = await pool.request().input("ano", sql.Int, ano).query(`
        SELECT * FROM take_or_pay_volume WHERE ano = @ano ORDER BY mes ASC
      `);

      const topEmpresas = await pool.request().query(`
        SELECT empresa, volume FROM take_or_pay_top
      `);

      const valores = await pool.request().query(`
        SELECT trimestre, tarifa FROM take_or_pay_valores
      `);

      const rateiosFixos = await pool.request().query(`
        SELECT empresa, trimestre, rateio FROM take_or_pay_rateio
      `);

      return {
        volumes: volumes.recordset,
        topEmpresas: topEmpresas.recordset,
        valores: valores.recordset,
        rateiosFixos: rateiosFixos.recordset,
      };
    } catch (err) {
      console.error("Erro ao listar Take Or Pay:", err);
      throw err;
    }
  }

  async rateio(periodo, empresa) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("periodo", sql.VarChar, periodo)
        .input("empresa", sql.VarChar, empresa).query(`
      SELECT rateio 
      FROM take_or_pay_rateio
      WHERE empresa = @empresa AND trimestre = @periodo
    `);

      return result.recordset[0]?.rateio;
    } catch (err) {
      console.error("Erro ao listar rateio:", err);
      throw err;
    }
  }

  async adicionar(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("ano", sql.Int, dados.ano)
        .input("mes", sql.Int, dados.mes)
        .input("empresa", sql.VarChar, dados.empresa)
        .input("navio", sql.VarChar, dados.navio)
        .input("carga", sql.Float, dados.carga)
        .input("obs", sql.VarChar, dados.obs).query(`
          INSERT INTO take_or_pay_volume
          (ano, mes, empresa, navio, carga, obs)
          VALUES (@ano, @mes, @empresa, @navio, @carga, @obs)
        `);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      s;
      throw err;
    }
  }

  async atualizar(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, dados.id)
        .input("ano", sql.Int, dados.ano)
        .input("mes", sql.Int, dados.mes)
        .input("empresa", sql.VarChar, dados.empresa)
        .input("navio", sql.VarChar, dados.navio)
        .input("carga", sql.Float, dados.carga)
        .input("obs", sql.VarChar, dados.obs).query(`
          UPDATE take_or_pay_volume
          SET 
            ano = @ano,
            mes = @mes,
            empresa = @empresa,
            navio = @navio,
            carga = @carga,
            obs = @obs
          WHERE id = @id
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao atualizar o contrato:`, err);
      throw err;
    }
  }

  async atualizaRateio(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("empresa", sql.VarChar, dados.empresa)
        .input("trimestre", sql.VarChar, dados.trimestre)
        .input("rateio", sql.Float, dados.rateio).query(`
          UPDATE take_or_pay_rateio
          SET rateio = @rateio
          WHERE empresa = @empresa 
          AND trimestre = @trimestre
        `);

      return result;
    } catch (err) {
      console.error(`Erro ao atualizar o rateio:`, err);
      throw err;
    }
  }

  async atualizaTarifa(dados) {
    try {
      const pool = await poolPromise;
      return await pool
        .request()
        .input("trimestre", sql.VarChar, dados.trimestre)
        .input("tarifa", sql.Float, dados.tarifa).query(`
        UPDATE take_or_pay_valores
        SET tarifa = @tarifa
        WHERE trimestre = @trimestre
      `);
    } catch (err) {
      console.error(`Erro no model:`, err);
      throw err;
    }
  }

  async deletar(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("id", sql.Int, id).query(`
          DELETE FROM take_or_pay_volume
          WHERE id = @id
        `);
      return result;
    } catch (err) {
      console.error(`Erro ao excluir o registro:`, err);
      throw err;
    }
  }
}

module.exports = new TopModel();
