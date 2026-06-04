const equipeModel = require("../models/equipe");

class EquipeController {
  async criar(req, res) {
    const { dados } = req.body;
    if (
      !dados.nome ||
      !dados.funcao ||
      !dados.cargo ||
      !dados.setor ||
      !dados.equipe ||
      !dados.gestor ||
      !dados.email
    ) {
      return res.status(200).json({
        type: "error",
        message: "Dados incompletos!",
      });
    }

    try {
      await equipeModel.criar(dados);
      return res.status(200).json({
        type: "success",
        message: "Colaborador adicionado com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar colaborador",
        error: error.message,
      });
    }
  }

  async listar(req, res) {
    try {
      const lista = await equipeModel.listar();

      res.status(200).json({
        type: "success",
        data: lista,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar equipe",
        error: error.message,
      });
    }
  }

  async atualizar(req, res) {
    const { dados } = req.body;
    const { id } = req.params;

    if (
      !dados.nome ||
      !dados.funcao ||
      !dados.cargo ||
      !dados.setor ||
      !dados.equipe ||
      !dados.gestor ||
      !dados.email
    ) {
      return res.status(200).json({
        type: "error",
        message: "Dados incompletos para atualizar colaborador.",
      });
    }

    try {
      await equipeModel.atualizar(dados, id);

      return res.status(200).json({
        type: "success",
        message: `Colaborador atualizado com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar colaborador`,
        error: error.message,
      });
    }
  }

  async deletar(req, res) {
    const { id } = req.params;
    try {
      await equipeModel.deletar(id);

      return res.status(200).json({
        type: "success",
        message: `Colaborador excluído com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao excluir colaborador`,
        error: error.message,
      });
    }
  }
}

module.exports = new EquipeController();
