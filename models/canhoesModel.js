const conexao = require("../infraestrutura/conexao");

class canhoesModel {
  listar() {
    const sql = "SELECT id, can, modo, posicao FROM canhoes";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, results) => {
        if (err) {
          console.error("Erro ao buscar canhões:", err);
          reject(err);
        }
        resolve(results);
      });
    });
  }

  atualizar(can, modo) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE canhoes SET modo = ? WHERE can = ?";

      conexao.query(sql, [modo, can], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  modo() {
    const sql = "SELECT * FROM statusHumectacao";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, results) => {
        if (err) {
          console.error("Erro no status do sistema:", err);
          reject(err);
        }
        resolve(results);
      });
    });
  }

  atualizarModo(disponivel) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE statusHumectacao SET disponivel = ?";

      conexao.query(sql, [disponivel], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports = new canhoesModel();
