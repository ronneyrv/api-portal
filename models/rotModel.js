const conexao = require("../infraestrutura/conexao");

class RotModel {
  armazenar(
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
    const sql = `
      INSERT INTO relatorios_turno (
        data, turno, equipe, elaborador, supervisao,
        info_tcld, patio, patio_umectacao, patio_polimero, patio_polimero_vol, patio_obs,
        valor_estoque, programacao, retoma_turno, eventos, eventos_andamento
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        equipe = VALUES(equipe),
        elaborador = VALUES(elaborador),
        supervisao = VALUES(supervisao),
        info_tcld = VALUES(info_tcld),
        patio = VALUES(patio),
        patio_umectacao = VALUES(patio_umectacao),
        patio_polimero = VALUES(patio_polimero),
        patio_polimero_vol = VALUES(patio_polimero_vol),
        patio_obs = VALUES(patio_obs),
        valor_estoque = VALUES(valor_estoque),
        programacao = VALUES(programacao),
        retoma_turno = VALUES(retoma_turno),
        eventos = VALUES(eventos),
        eventos_andamento = VALUES(eventos_andamento)
    `;

    return new Promise((resolve, reject) => {
      const valores = [
        data,
        turno,
        equipe,
        elaborador,
        supervisao,
        JSON.stringify(info_tcld),
        JSON.stringify(patio),
        JSON.stringify(patio_umectacao),
        JSON.stringify(patio_polimero),
        JSON.stringify(patio_polimero_vol),
        patio_obs,
        JSON.stringify(valor_estoque),
        JSON.stringify(programacao),
        JSON.stringify(retoma_turno),
        JSON.stringify(eventos),
        eventos_andamento,
      ];

      conexao.query(sql, valores, (err, result) => {
        if (err) {
          console.error("Erro ao salvar relatório:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  buscar(data, turno) {
    const sql = "SELECT * FROM relatorios_turno WHERE data = ? AND turno = ?";

    return new Promise((resolve, reject) => {
      conexao.query(sql, [data, turno], async (err, result) => {
        if (err) {
          console.error("Erro ao buscar Rot:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports = new RotModel();
