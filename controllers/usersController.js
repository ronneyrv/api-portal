const userModel = require("../models/userModel");

const permissoes = {
  visitante: 10,
  manutencao: 9,
  operacao: 7,
  supervisao: 6,
  analistico: 5,
  gerencia: 3,
  desenvolvedor: 2,
  admin: 1,
};

class UsersController {
  async criar(req, res) {
    const newUser = req.body;
    try {
      if (!newUser.usuario || !newUser.email || !newUser.senha) {
        return res.status(400).json({
          type: "warning",
          message: "Preencha todos os campos",
        });
      }
      await userModel.criar(newUser);
      res
        .status(200)
        .json({ type: "success", message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
      console.error("Erro ao criar usuário:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao criar usuário",
      });
    }
  }

  buscar(req, res) {
    userModel
      .listar()
      .then((users) =>
        res.status(200).json({
          type: "success",
          data: users,
        })
      )
      .catch((error) =>
        res
          .status(404)
          .json({ type: "error", message: "Erro ao buscar usuários" })
      );
  }

  async atualizar(req, res) {
    const body = req.body;

    try {
      if (!body.email) {
        return res.status(400).json({
          type: "error",
          message: "O e-mail é obrigatórios!",
        });
      }

      if (body.senha) {
        if (body.senha.length < 6) {
          return res.status(400).json({
            type: "error",
            message: "Senha com menos de 6 caracteres!",
          });
        }
      }

      if (body.permissao) {
        const nivel = permissoes[body.permissao.toLowerCase()];

        if (!nivel) {
          return res.status(400).json({
            type: "error",
            message: "Permissão não localizada!",
          });
        }

        body.nivel = nivel;
      }

      const { feedback } = await userModel.atualizar(body);
      res.status(200).json({
        type: "success",
        message: feedback || "Usuário atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao atualizar usuário",
      });
    }
  }

  async deletar(req, res) {
    const { id } = req.params;
    try {
      await userModel.deletar(id);
      res
        .status(200)
        .json({ type: "success", message: "Usuário excluído com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao excluir usuário",
      });
    }
  }
}

module.exports = new UsersController();
