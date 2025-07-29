const canhoesModel = require("../models/canhoes");

class CanhoesController {
  listar(req, res) {
    canhoesModel.listar()
      .then((canhoes) =>
        res.status(200).json({
          type: "success",
          data: canhoes,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar canhões",
          error: error.message,
        })
      );
  }

  atualizar(req, res) {
    const { can, modo } = req.body;

    try {
      if (!can || !modo) {
        return res.status(400).json({
          type: "error",
          message: "Erro ao localizar canhão",
        });
      }
      canhoesModel.atualizar(can, modo).then((resultado) =>
        res.status(200).json({
          type: "success",
          message: "Status atualizado com sucesso",
          resultado,
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar canhão:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao atualizar Status",
      });
    }
  }

  modo(req, res) {
    try {
      canhoesModel.modo().then((result) =>
        res.status(200).json({
          type: "success",
          data: result,
        })
      );
    } catch (error) {
      console.error("Erro ao verificar o status:", error.message || error);
      res.status(500).json({
        type: "error",
        message: error.message || "Erro ao verificar o status",
      });
    }
  }

  atualizarModo(req, res) {
    const { disponivel } = req.body;

    try {
      if (!disponivel) {
        return res.status(400).json({
          type: "error",
          message: "Erro no status do sistema",
        });
      }
      canhoesModel.atualizarModo(disponivel).then(() =>
        res.status(200).json({
          type: "success",
          message: "Status do sistema atualizado com sucesso",
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar o status:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao atualizar o Status",
      });
    }
  }
}
module.exports = new CanhoesController();
