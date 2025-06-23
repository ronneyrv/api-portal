const conexao = require("../infraestrutura/conexao");

class progRetomaModel {
  listar(semana) {
    const sql = "SELECT * FROM progRetoma WHERE semana = ?";

    return new Promise((resolve, reject) => {
      conexao.query(sql, [semana], (err, result) => {
        if (err) {
          console.error("Erro ao buscar programação:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }

  add(dados) {
    const sql = `
    INSERT INTO progretoma (
      dia, semana,
      maquina_ug1, pilha_ug1, navio_ug1, obs_ug1,
      maquina_ug2, pilha_ug2, navio_ug2, obs_ug2,
      maquina_ug3, pilha_ug3, navio_ug3, obs_ug3,
      maquina_empilha, pilha_empilha, navio_empilha, obs_empilha
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      maquina_ug1 = VALUES(maquina_ug1),
      pilha_ug1 = VALUES(pilha_ug1),
      navio_ug1 = VALUES(navio_ug1),
      obs_ug1 = VALUES(obs_ug1),
      maquina_ug2 = VALUES(maquina_ug2),
      pilha_ug2 = VALUES(pilha_ug2),
      navio_ug2 = VALUES(navio_ug2),
      obs_ug2 = VALUES(obs_ug2),
      maquina_ug3 = VALUES(maquina_ug3),
      pilha_ug3 = VALUES(pilha_ug3),
      navio_ug3 = VALUES(navio_ug3),
      obs_ug3 = VALUES(obs_ug3),
      maquina_empilha = VALUES(maquina_empilha),
      pilha_empilha = VALUES(pilha_empilha),
      navio_empilha = VALUES(navio_empilha),
      obs_empilha = VALUES(obs_empilha)
      `;
    return new Promise((resolve, reject) => {
      const values = [
        dados.dia,
        dados.semana,
        dados.maquina_ug1,
        dados.pilha_ug1,
        dados.navio_ug1,
        dados.obs_ug1,
        dados.maquina_ug2,
        dados.pilha_ug2,
        dados.navio_ug2,
        dados.obs_ug2,
        dados.maquina_ug3,
        dados.pilha_ug3,
        dados.navio_ug3,
        dados.obs_ug3,
        dados.maquina_empilha,
        dados.pilha_empilha,
        dados.navio_empilha,
        dados.obs_empilha,
      ];

      conexao.query(sql, values, (err, result) => {
        if (err) {
          console.error("Erro ao adicionar programação:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}
module.exports = new progRetomaModel();
