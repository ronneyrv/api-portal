const progRetomaModel = require("../models/progRetomaModel");

class progRetomaController {
  listar(req, res) {
    const semana = req.params.semana;

    progRetomaModel
      .listar(semana)
      .then((programacao) => {
        if (programacao.length === 0) {
          return res.status(200).json({
            type: "error",
            message: `Programação Semana ${semana} não definida.`,
          });
        }
        res.status(200).json({
          type: "success",
          data: programacao,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar estoque",
          error: error.message,
        })
      );
  }

  add(req, res) {
    const dados = req.body;
    console.log(dados);

    if (!Array.isArray(dados) || dados.length === 0) {
      return res.status(400).json({
        type: "error",
        message: "Nenhum dado recebido!",
      });
    }

    const promessas = dados.map((grupo) => progRetomaModel.add(grupo));
    
    Promise.all(promessas)
    .then(() => {
      res.status(200).json({
        type: "success",
        message: "Programações adicionadas com sucesso",
      });
    })
    .catch((error) => {
      console.error("Erro ao adicionar programações:", error);
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar uma ou mais programações",
        error: error.message,
      });
    });
  }
}
module.exports = new progRetomaController();
