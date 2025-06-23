const conexao = require("../infraestrutura/conexao");

class observacaoModel {
  listar() {
    const sql = "SELECT * FROM obsRot";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, results) => {
        if (err) {
          console.error("Erro ao buscar observações:", err);
          reject(err);
        }
        resolve(results);
      });
    });
  }

  atualizar(newObs, id) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE obsRot SET observacao = ? WHERE id = ?";

      conexao.query(sql, [newObs, id], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  listarEvento() {
    const sql = "SELECT * FROM evento_andamento";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, results) => {
        if (err) {
          console.error("Erro ao buscar evento:", err);
          reject(err);
        }
        resolve(results);
      });
    });
  }

  atualizarEvento(newEvent, id) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE evento_andamento SET andamento = ? WHERE id = ?";

      conexao.query(sql, [newEvent, id], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports = new observacaoModel();
