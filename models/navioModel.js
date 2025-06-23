const conexao = require("../infraestrutura/conexao");

class navioModel {
  adicionar(dados) {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO descarregamento_navios (navio, cliente, atracacao1, inicio_op, arqueacao_inicial, atracado, finalizado) VALUES (?, ?, ?, ?, ?, ?, ?)";

      const values = [
        dados.navio,
        dados.cliente,
        dados.atracacao1,
        dados.inicio_op,
        dados.arqueacao_inicial,
        dados.atracado || 1,
        dados.finalizado || 0,
      ];

      conexao.query(sql, values, (err, result) => {
        if (err) {
          console.error("Erro ao adicionar navio:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  listar() {
    const sql = "SELECT * FROM descarregamento_navios";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, result) => {
        if (err) {
          console.error("Erro ao listar Navios:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }

  buscar() {
    const final = 0;

    const sql = "SELECT * FROM descarregamento_navios WHERE finalizado = ?";
    return new Promise((resolve, reject) => {
      conexao.query(sql, [final], (err, result) => {
        if (err) {
          console.error("Erro ao buscar Navios:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }

  listarNavio(id) {
    const sql = "SELECT * FROM descarregamento_navios WHERE navio = ?";

    return new Promise((resolve, reject) => {
      conexao.query(sql, [id], (err, result) => {
        if (err) {
          console.error("Erro ao buscar Navio:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }

  atualizar(dados, id) {
    return new Promise((resolve, reject) => {
      const sql =
        "UPDATE timepptm SET nome = ?, funcao = ?, cargo = ?, setor = ?, equipe = ?, gestor = ?, email = ?, ativo = ? WHERE id = ?";

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

  pilhas() {
    const sql = "SELECT * FROM descarregamento_navio_pilha WHERE volume > 0";

    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, result) => {
        if (err) {
          console.error("Erro ao buscar Navio:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports = new navioModel();
