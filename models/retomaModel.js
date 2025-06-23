const conexao = require("../infraestrutura/conexao");

class RetomaModel {
  listar(data, turno) {
    const sql = "SELECT * FROM realRetoma WHERE data = ? AND turno = ?";

    return new Promise((resolve, reject) => {
      conexao.query(sql, [data, turno], async (err, result) => {
        if (err) {
          console.error("Erro ao buscar retoma:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports = new RetomaModel();
