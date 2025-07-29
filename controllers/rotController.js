const rotModel = require("../models/rot");

class RotController {
  armazenar(req, res) {
    const {
      data,
      turno,
      equipe,
      elaborador,
      supervisao,
      info_tcld,
      patio,
      patio_umectacao,
      patio_polimero,
      patio_polimero_vol,
      patio_obs,
      valor_estoque,
      programacao,
      retoma_turno,
      eventos,
      eventos_andamento,
    } = req.body;

    if (!data || !turno) {
      return res
        .status(200)
        .json({ type: "info", message: "Preencha a Data e o Turno!" });
    }

    rotModel
      .armazenar(
        data,
        turno,
        equipe,
        elaborador,
        supervisao,
        info_tcld,
        patio,
        patio_umectacao,
        patio_polimero,
        patio_polimero_vol,
        patio_obs,
        valor_estoque,
        programacao,
        retoma_turno,
        eventos,
        eventos_andamento
      )
      .then(() => {
        res.status(200).json({
          type: "success",
          message: "Salvo com sucesso!",
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao armazenar informações",
          error: error.message,
        })
      );
  }

  buscar(req, res) {
    const { data, turno } = req.body;

    if (!data || !turno) {
      return res
        .status(400)
        .json({ type: "error", message: "Data e Turno obrigatórios!" });
    }

    rotModel
      .buscar(data, turno)
      .then((rot) => {
        if (rot.length === 0) {
          return res.status(200).json({
            type: "info",
            message: "ROT não localizado na base de dados, informe outra data!",
          });
        }

        const rotFormatado = rot.map((item) => ({
          ...item,
          data: new Date(item.data).toISOString().split("T")[0], // formata para "yyyy-MM-dd"
        }));

        res.status(200).json({
          type: "success",
          data: rotFormatado,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar retoma",
          error: error.message,
        })
      );
  }
}

module.exports = new RotController();
