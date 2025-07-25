const { sql, poolPromise } = require("../infraestrutura/conexao");
const bcrypt = require("bcrypt");

class UserModel {
  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM users");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      throw err;
    }
  }

  async criar(newUser) {
    try {
      const pool = await poolPromise;

      // Verificar se email já existe
      const check = await pool
        .request()
        .input("email", sql.VarChar, newUser.email)
        .query("SELECT * FROM users WHERE email = @email");

      if (check.recordset.length > 0) {
        throw new Error("Este e-mail já está cadastrado");
      }

      const hashedSenha = await bcrypt.hash(newUser.senha, 10);

      await pool
        .request()
        .input("usuario", sql.VarChar, newUser.usuario)
        .input("email", sql.VarChar, newUser.email)
        .input("senha", sql.VarChar, hashedSenha)
        .input("permissao", sql.VarChar, newUser.permissao || "visitante")
        .input("nivel", sql.Int, newUser.nivel || 10)
        .query(
          "INSERT INTO users (usuario, email, senha, permissao, nivel) VALUES (@usuario, @email, @senha, @permissao, @nivel)"
        );
    } catch (err) {
      throw err;
    }
  }

  async atualizar(updateUser) {
    try {
      const pool = await poolPromise;
      let feedback = "";

      // Primeiro: verificar se o email existe
      const verificar = await pool
        .request()
        .input("email", sql.VarChar, updateUser.email)
        .query("SELECT * FROM users WHERE email = @email");

      if (verificar.recordset.length === 0) {
        throw new Error("E-mail não encontrado");
      }

      if (updateUser.senha) {
        const hashedSenha = await bcrypt.hash(updateUser.senha, 10);

        await pool
          .request()
          .input("senha", sql.VarChar, hashedSenha)
          .input("email", sql.VarChar, updateUser.email)
          .query("UPDATE users SET senha = @senha WHERE email = @email");

        feedback = "Nova senha cadastrada";
      } else if (updateUser.permissao) {
        await pool
          .request()
          .input("permissao", sql.VarChar, updateUser.permissao)
          .input("nivel", sql.Int, updateUser.nivel)
          .input("email", sql.VarChar, updateUser.email)
          .query(
            "UPDATE users SET permissao = @permissao, nivel = @nivel WHERE email = @email"
          );

        feedback = "Permissão atualizada";
      } else {
        await pool
          .request()
          .input("usuario", sql.VarChar, updateUser.usuario)
          .input("email", sql.VarChar, updateUser.email)
          .query("UPDATE users SET usuario = @usuario WHERE email = @email");

        feedback = "Usuário atualizado com sucesso";
      }

      return { feedback };
    } catch (err) {
      throw err;
    }
  }

  async deletar(id) {
    try {
      const pool = await poolPromise;

      await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM users WHERE id = @id");

      return true;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new UserModel();
