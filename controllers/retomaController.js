const retomaModel = require("../models/retomaModel");

class RetomaController {
  listar(req, res) {
    const { data, turno } = req.body;

    if (!data || !turno) {
      return res
        .status(400)
        .json({ type: "error", message: "Data ou turno não definidos!" });
    }

    retomaModel.listar(data, turno)
      .then((retomado) => {
        if (retomado.length === 0) {
          return res.status(200).json({
            type: "info",
            message: "Sem retoma no turno.",
          });
        }
        res.status(200).json({
          type: "success",
          data: retomado,
        })}
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar retoma",
          error: error.message,
        })
      );
  }

}

module.exports = new RetomaController();
