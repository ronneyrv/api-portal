const userModel = require("../models/user");

class UsersController {
  async criar(req, res) {
    const newUser = req.body;
    try {
      if (!newUser.usuario || !newUser.email || !newUser.senha) {
        return res.status(200).json({
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
      res.status(200).json({
        type: "error",
        message: error.message || "Erro ao criar usuário",
      });
    }
  }

  async buscar(req, res) {
    try {
      const users = await userModel.listar();

      res.status(200).json({
        type: "success",
        data: users,
      });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error.message || error);

      res.status(200).json({
        type: "error",
        message: "Erro ao buscar usuários",
      });
    }
  }

  async atualizar(req, res) {
    const {dados} = req.body;
    const mapaPermissoes = {
      10: "VISITANTE",
      9: "MANUTENÇÃO",
      7: "OPERAÇÃO",
      6: "SUPERVISÃO",
      5: "ANALÍTICO",
      3: "GERÊNCIA",
      2: "DESENVOLVEDOR",
      1: "ADMIN",
    };
    
    try {
      if (!dados.email) {
        return res.status(200).json({
          type: "error",
          message: "E-mail obrigatórios",
        });
      }

      if (dados.senha) {
        if (dados.senha.length < 6) {
          return res.status(200).json({
            type: "error",
            message: "Senha com menos de 6 caracteres!",
          });
        }
        if (dados.senha !== dados.senha2) {
          return res.status(200).json({
            type: "error",
            message: "As senhas não coincidem!",
          });
        }
      }

      if (dados.nivel && mapaPermissoes[dados.nivel]) {
        dados.permissao = mapaPermissoes[dados.nivel];
        dados.nivel = parseInt(dados.nivel, 10);
      }

      const { feedback } = await userModel.atualizar(dados);
      res.status(200).json({
        type: "success",
        message: feedback || "Usuário atualizado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao atualizar",
        error: error.message,
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
      res.status(200).json({
        type: "error",
        message: error.message || "Erro ao excluir usuário",
      });
    }
  }
}

module.exports = new UsersController();
