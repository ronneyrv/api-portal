const conexao = require("../infraestrutura/conexao");

class estoqueModel {
  listar() {
    const sql = "SELECT * FROM estoque ORDER BY id DESC LIMIT 1";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, result) => {
        if (err) {
          console.error("Erro ao buscar estoque:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }
}
module.exports = new estoqueModel();
