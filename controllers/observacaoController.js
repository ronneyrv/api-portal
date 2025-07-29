const observacaoModel = require("../models/observacao");

class ObservacaoController {
  listar(req, res) {
    observacaoModel
      .listar()
      .then((observacoes) =>
        res.status(200).json({
          type: "success",
          data: observacoes,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar observação",
          error: error.message,
        })
      );
  }

  atualizar(req, res) {
    const id = 1;
    const { newObs } = req.body;
    try {
      observacaoModel.atualizar(newObs, id).then(() =>
        res.status(200).json({
          type: "success",
          message: "Observação atualizada com sucesso",
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar a observação:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao atualizar a observação",
      });
    }
  }

  listarEvento(req, res) {
    observacaoModel
      .listarEvento()
      .then((evento) =>
        res.status(200).json({
          type: "success",
          data: evento,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar evento",
          error: error.message,
        })
      );
  }

  atualizarEvento(req, res) {
    const id = 1;
    const { newEvent } = req.body;
    try {
      observacaoModel.atualizarEvento(newEvent, id).then(() =>
        res.status(200).json({
          type: "success",
          message: "Evento em andamento atualizado com sucesso",
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar o evento:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao atualizar o evento",
      });
    }
  }

}
module.exports = new ObservacaoController();
