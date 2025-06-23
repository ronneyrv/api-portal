const estoqueModel = require("../models/estoqueModel");

class estoqueController {
  listar(req, res) {
    estoqueModel
      .listar()
      .then((valores) =>
        res.status(200).json({
          type: "success",
          data: valores,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar estoque",
          error: error.message,
        })
      );
  }
}
module.exports = new estoqueController();
