const conexao = require("../infraestrutura/conexao");

class equipeModel {
  listar() {
    const sql = "SELECT * FROM timepptm";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, result) => {
        if (err) {
          console.error("Erro ao listar equipe:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }

  criar(dados) {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO timepptm (nome, funcao, cargo, setor, equipe, gestor, email, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

      const values = [
        dados.nome,
        dados.funcao,
        dados.cargo,
        dados.setor,
        dados.equipe,
        dados.gestor,
        dados.email,
        dados.ativo,
      ];

      conexao.query(sql, values, (err, result) => {
        if (err) {
          console.error("Erro ao adicionar colaborador:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  atualizar(dados, id) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE timepptm SET nome = ?, funcao = ?, cargo = ?, setor = ?, equipe = ?, gestor = ?, email = ?, ativo = ? WHERE id = ?";

      const values = [
        dados.nome,
        dados.funcao,
        dados.cargo,
        dados.setor,
        dados.equipe,
        dados.gestor,
        dados.email,
        dados.ativo,
      ];

      conexao.query(sql, [values, id], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

}

module.exports = new equipeModel();
