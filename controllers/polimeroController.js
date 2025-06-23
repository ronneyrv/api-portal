const polimeroModel = require("../models/polimeroModel");

class PolimeroController {
  condicao(req, res) {
    polimeroModel
      .condicao()
      .then((polimero) =>
        res.status(200).json({
          type: "success",
          data: polimero,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro na condição do polímero das pilhas",
          error: error.message,
        })
      );
  }

  volume(req, res) {
    polimeroModel
      .volume()
      .then((polimero) =>
        res.status(200).json({
          type: "success",
          data: polimero,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro no volume de polímero",
          error: error.message,
        })
      );
  }
}
module.exports = new PolimeroController();
