const equipeModel = require("../models/equipeModel");

class EquipeController {
  criar(req, res) {
    const { dados } = req.body;
    if (
      !dados.nome ||
      !dados.funcao ||
      !dados.cargo ||
      !dados.setor ||
      !dados.equipe ||
      !dados.gestor ||
      !dados.email ||
      !dados.ativo
    ) {
      return res.status(400).json({
        type: "error",
        message: "Dados incompletos!",
      });
    }

    equipeModel
      .criar(dados)
      .then((res) =>
        res.status(200).json({
          type: "success",
          message: "Colaborador adicionado com sucesso",
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao adicionar colaborador",
          error: error.message,
        })
      );
  }

  listar(req, res) {
    equipeModel
      .listar()
      .then((equipe) =>
        res.status(200).json({
          type: "success",
          data: equipe,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar equipe",
          error: error.message,
        })
      );
  }

  atualizar(req, res) {
    const { dados } = req.body;
    const { id } = req.params;
    if (
      !dados.nome ||
      !dados.funcao ||
      !dados.cargo ||
      !dados.setor ||
      !dados.equipe ||
      !dados.gestor ||
      !dados.email ||
      !dados.ativo
    ) {
      return res.status(400).json({
        type: "error",
        message: "Dados incompletos!",
      });
    }
    equipeModel
      .atualizar(dados, id)
      .then(() =>
        res.status(200).json({
          type: "success",
          message: "Colaborador atualizado com sucesso",
        })
      )
      .catch((error) => {
        console.error("Erro ao atualizar colaborador:", error.message || error);
        res.status(500).json({
          type: "error",
          message: error.message || "Erro ao atualizar Colaborador",
        });
      });
  }
}

module.exports = new EquipeController();
