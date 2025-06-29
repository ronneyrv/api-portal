const { poolPromise, sql } = require("../infraestrutura/conexao");

class RotModel {
  async armazenar(
    data,
    turno,
    equipe,
    elaborador,
    supervisao,
    info_tcld,
    patio,
    patio_umectacao,
    patio_polimero,
    patio_polimero_vol,
    patio_obs,
    valor_estoque,
    programacao,
    retoma_turno,
    eventos,
    eventos_andamento
  ) {
    try {
      const pool = await poolPromise;

      const request = pool.request()
        .input("data", sql.VarChar, data)
        .input("turno", sql.VarChar, turno)
        .input("equipe", sql.VarChar, equipe)
        .input("elaborador", sql.VarChar, elaborador)
        .input("supervisao", sql.VarChar, supervisao)
        .input("info_tcld", sql.NVarChar(sql.MAX), JSON.stringify(info_tcld))
        .input("patio", sql.NVarChar(sql.MAX), JSON.stringify(patio))
        .input("patio_umectacao", sql.NVarChar(sql.MAX), JSON.stringify(patio_umectacao))
        .input("patio_polimero", sql.NVarChar(sql.MAX), JSON.stringify(patio_polimero))
        .input("patio_polimero_vol", sql.NVarChar(sql.MAX), JSON.stringify(patio_polimero_vol))
        .input("patio_obs", sql.NVarChar(sql.MAX), patio_obs)
        .input("valor_estoque", sql.NVarChar(sql.MAX), JSON.stringify(valor_estoque))
        .input("programacao", sql.NVarChar(sql.MAX), JSON.stringify(programacao))
        .input("retoma_turno", sql.NVarChar(sql.MAX), JSON.stringify(retoma_turno))
        .input("eventos", sql.NVarChar(sql.MAX), JSON.stringify(eventos))
        .input("eventos_andamento", sql.NVarChar(sql.MAX), eventos_andamento);

      const sqlMerge = `
        MERGE relatorios_turno AS target
        USING (SELECT @data AS data, @turno AS turno) AS source
        ON (target.data = source.data AND target.turno = source.turno)
        WHEN MATCHED THEN
          UPDATE SET
            equipe = @equipe,
            elaborador = @elaborador,
            supervisao = @supervisao,
            info_tcld = @info_tcld,
            patio = @patio,
            patio_umectacao = @patio_umectacao,
            patio_polimero = @patio_polimero,
            patio_polimero_vol = @patio_polimero_vol,
            patio_obs = @patio_obs,
            valor_estoque = @valor_estoque,
            programacao = @programacao,
            retoma_turno = @retoma_turno,
            eventos = @eventos,
            eventos_andamento = @eventos_andamento
        WHEN NOT MATCHED THEN
          INSERT (
            data, turno, equipe, elaborador, supervisao,
            info_tcld, patio, patio_umectacao, patio_polimero, patio_polimero_vol,
            patio_obs, valor_estoque, programacao, retoma_turno, eventos, eventos_andamento
          )
          VALUES (
            @data, @turno, @equipe, @elaborador, @supervisao,
            @info_tcld, @patio, @patio_umectacao, @patio_polimero, @patio_polimero_vol,
            @patio_obs, @valor_estoque, @programacao, @retoma_turno, @eventos, @eventos_andamento
          );
      `;

      const result = await request.query(sqlMerge);
      return result;
    } catch (err) {
      console.error("Erro ao salvar relatório:", err);
      throw err;
    }
  }

  async buscar(data, turno) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("data", sql.VarChar, data)
        .input("turno", sql.VarChar, turno)
        .query("SELECT * FROM relatorios_turno WHERE data = @data AND turno = @turno");

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Rot:", err);
      throw err;
    }
  }
}

module.exports = new RotModel();
