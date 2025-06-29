const { sql, poolPromise } = require("../infraestrutura/conexao");
const bcrypt = require("bcrypt");

class LoginModel {
  async autenticar(usuario, senha) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("usuario", sql.VarChar, usuario)
        .query("SELECT * FROM users WHERE usuario = @usuario");

      if (result.recordset.length === 0) {
        throw new Error("Usuário ou senha inválidos");
      }

      const user = result.recordset[0];
      const senhaConfere = await bcrypt.compare(senha, user.senha);

      if (!senhaConfere) {
        throw new Error("Usuário ou senha inválidos");
      }

      return {
        id: user.id,
        email: user.email,
        usuario: user.usuario,
        nivel: user.nivel,
      };
    } catch (error) {
      console.error("Erro na autenticação:", error.message || error);
      throw error;
    }
  }
}

module.exports = new LoginModel();
