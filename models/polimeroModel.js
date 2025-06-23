const conexao = require("../infraestrutura/conexao");

class polimeroModel {
  condicao() {
    const sql = "SELECT * FROM statuspolimero";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, results) => {
        if (err) {
          console.error("Erro ao verificar a condição do polímero:", err);
          reject(err);
        }
        resolve(results);
      });
    });
  }

  volume() {
    const sql = "SELECT * FROM volumePolimero";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, results) => {
        if (err) {
          console.error("Erro ao verificar o volume de polímero:", err);
          reject(err);
        }
        resolve(results);
      });
    });
  }

}
module.exports = new polimeroModel();
