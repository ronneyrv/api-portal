const conexao = require("../infraestrutura/conexao");
const bcrypt = require("bcrypt");

class LoginModel {
  async autenticar(usuario, senha) {
    const sql = "SELECT * FROM users WHERE usuario = ?";

    return new Promise((resolve, reject) => {
      conexao.query(sql, [usuario], async (err, results) => {
        if (err) {
          console.error("Erro na autenticação:", err);
          return reject(new Error("Erro ao buscar usuários"));
        }

        if (results.length === 0) {
          return reject(new Error("Usuário ou senha inválidos"));
        }

        const user = results[0];
        const senhaConfere = await bcrypt.compare(senha, user.senha);

        if (!senhaConfere) {
          return reject(new Error("Usuário ou senha inválidos"));
        }

        resolve({
          id: user.id,
          email: user.email,
          usuario: user.usuario,
          nivel: user.nivel,
        });
      });
    });
  }
}

module.exports = new LoginModel();
