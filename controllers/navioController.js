const navioModel = require("../models/navioModel");

class NavioController {
  adicionar(req, res) {
    const dados = req.body;
    if (
      !dados.navio ||
      !dados.cliente ||
      !dados.atracacao1 ||
      !dados.inicio_op ||
      !dados.arqueacao_inicial
    ) {
      return res.status(400).json({
        type: "error",
        message: "Dados do Navio incompletos!",
      });
    }

    navioModel
      .adicionar(dados)
      .then((res) =>
        res.status(200).json({
          type: "success",
          message: "Navio adicionado com sucesso",
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao adicionar Navio",
          error: error.message,
        })
      );
  }

  listar(req, res) {
    navioModel
      .listar()
      .then((navios) =>
        res.status(200).json({
          type: "success",
          data: navios,
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar navios",
          error: error.message,
        })
      );
  }

  previsaoFim(req, res) {
    navioModel
      .previsaoFim()
      .then(() =>
        res.status(200).json({
          type: "success",
          message: "Previsão de término atualizada com sucesso",
        })
      )
      .catch((error) => {
        console.error("Erro ao atualizar previsão:", error.message || error);
        res.status(500).json({
          type: "error",
          message: error.message || "Erro ao atualizar previsão",
        });
      });
  }

  pilhas(req, res) {
    navioModel
      .pilhas()
      .then((pilhas) => {
        res.status(200).json({
          type: "success",
          data: pilhas,
        });
      })
      .catch((error) => {
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar pilhas",
          error: error.message,
        });
      });
  }

  buscar(req, res) {
    navioModel
      .buscar()
      .then((navio) => {
        if (!navio || navio.length === 0) {
          return res.status(200).json({
            type: "info",
            message: "Berço ocioso",
          });
        }

        res.status(200).json({
          type: "success",
          data: navio,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar navios",
          error: error.message,
        })
      );
  }

  listarNavio(req, res) {
    const id = req.params.navio;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .listarNavio(id)
      .then((navio) => {
        if (!navio || navio.length === 0) {
          return res.status(404).json({
            type: "error",
            message: "Navio não encontrado.",
          });
        }

        res.status(200).json({
          type: "success",
          data: navio,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar navio",
          error: error.message,
        })
      );
  }

  atualizar(req, res) {
    const { dados } = req.body;
    const { inavio } = req.params;
    //atualizar os dados!!!
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
    navioModel
      .atualizar(dados, inavio)
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

module.exports = new NavioController();
