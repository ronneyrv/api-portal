const conexao = require("../infraestrutura/conexao");
const bcrypt = require("bcrypt");

class UserModel {
  listar() {
    const sql = "SELECT * FROM users";
    return new Promise((resolve, reject) => {
      conexao.query(sql, (err, results) => {
        if (err) {
          console.error("Erro ao buscar usuários:", err);
          reject(err)
            .status(404)
            .json({ type: "error", message: "Erro ao buscar usuários" });
        }
        resolve(results);
      });
    });
  }

  async criar(newUser) {
    return new Promise(async (resolve, reject) => {
      const verificarEmailSQL = "SELECT * FROM users WHERE email = ?";

      conexao.query(
        verificarEmailSQL,
        [newUser.email],
        async (err, results) => {
          if (err) return reject(err);

          if (results.length > 0) {
            return reject(new Error("Este e-mail já está cadastrado"));
          }
          const sql =
            "INSERT INTO users (usuario, email, senha, permissao, nivel) VALUES (?, ?, ?, ?, ?)";
          try {
            const hashedSenha = await bcrypt.hash(newUser.senha, 10);

            const values = [
              newUser.usuario,
              newUser.email,
              hashedSenha,
              newUser.permissao || "visitante",
              newUser.nivel || 10,
            ];

            conexao.query(sql, values, (err, results) => {
              if (err) {
                return reject(err);
              }
              resolve(results);
            });

          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  async atualizar(updateUser) {
    return new Promise(async (resolve, reject) => {
      let sql;
      let values;
      let feedback;

      if (updateUser.senha) {
        const hashedSenha = await bcrypt.hash(updateUser.senha, 10);
        const verificarEmailSQL = "SELECT * FROM users WHERE email = ?";
        
        conexao.query(
          verificarEmailSQL,
          [updateUser.email],
          async (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) {
              return reject(new Error("E-mail não encontrado"));
            }
          }
        );
        
        sql = `UPDATE users SET senha = ? WHERE email = ?`;
        values = [hashedSenha, updateUser.email];
        feedback = "Nova senha cadastrada";

      } else if (updateUser.permissao) {
        
        sql = `UPDATE users SET permissao = ?, nivel = ? WHERE email = ?`;
        values = [updateUser.permissao, updateUser.nivel, updateUser.email];
        feedback = "Permissão atualizada";

      } else {
        
        sql = `UPDATE users SET usuario = ? WHERE email = ?`;
        values = [updateUser.usuario, updateUser.email];
        feedback = "Usuário atualizado com sucesso";
      }

      try {
        conexao.query(sql, values, (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve({ results, feedback });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  deletar(id) {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM users WHERE id = ?";
      try {
        conexao.query(sql, [id], (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new UserModel();
