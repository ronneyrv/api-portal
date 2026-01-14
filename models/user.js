const { sql, poolPromise } = require("../infraestrutura/conexao");
const bcrypt = require("bcrypt");

class UserModel {
  async criar(newUser) {
    try {
      const pool = await poolPromise;

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
        .input("ativo", sql.Bit, 1)
        .query(
          "INSERT INTO users (usuario, email, senha, permissao, nivel) VALUES (@usuario, @email, @senha, @permissao, @nivel, @ativo)"
        );
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      throw err;
    }
  }

  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM users WHERE ativo = 1");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      throw err;
    }
  }

  async atualizar(updateUser) {
    try {
      const pool = await poolPromise;
      let feedback = "";

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

        feedback = "Senha alterada, entre novamente!";
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
      console.error("Erro ao atualizar usuário:", err);
      throw err;
    }
  }

  async deletar(id) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("ativo", sql.Bit, 0)
        .query("UPDATE users SET ativo = @ativo WHERE id = @id");

      return true;
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      throw err;
    }
  }
}

module.exports = new UserModel();
