const navioModel = require("../models/navio");

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

  buscarNavioAtracado(req, res) {
    navioModel
      .buscarNavioAtracado()
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

  ocorrenciasNavioAtracado(req, res) {
    const id = req.params.navio;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .ocorrenciasNavioAtracado(id)
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

  buscarOcorrencia(req, res) {
    const id = req.params.id;
    navioModel
      .buscarOcorrencia(id)
      .then((ocorrencia) => {
        if (!ocorrencia || ocorrencia.length === 0) {
          return res.status(200).json({
            type: "error",
            message: "Ocorrência não localizada",
          });
        }

        res.status(200).json({
          type: "success",
          data: ocorrencia,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar ocorrência",
          error: error.message,
        })
      );
  }

  atualizarOcorrenciaSimples(req, res) {
    const { dados } = req.body;
    const { id } = req.params;

    if (
      !dados.ocorrencia ||
      !dados.resumo ||
      !dados.sistema ||
      !dados.subsistema ||
      !dados.classificacao ||
      !dados.especialidade ||
      !dados.tipo_desligamento
    ) {
      return res.status(400).json({
        type: "error",
        message: "Dados incompletos!",
      });
    }

    navioModel
      .atualizarOcorrenciaSimples(dados, id)
      .then(() =>
        res.status(200).json({
          type: "success",
          message: "Ocorrência atualizada com sucesso",
        })
      )
      .catch((error) => {
        console.error("Erro ao atualizar ocorrência:", error.message || error);
        res.status(500).json({
          type: "error",
          message: error.message || "Erro ao atualizar ocorrência",
        });
      });
  }

  paretoOperacao(req, res) {
    const id = req.params.navio;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .paretoOperacao(id)
      .then((result) => {
        if (!result || result.length === 0) {
          return res.status(404).json({
            type: "error",
            message: "Nenhum dado encontrado para o navio.",
          });
        }

        const categorias = result.map((item) => item.resumo);
        const tempo = result.map((item) => item.tempo_total);

        res.status(200).json({
          type: "success",
          data: {
            categorias,
            tempo,
          },
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar dados do navio",
          error: error.message,
        })
      );
  }

  paretoManutencao(req, res) {
    const id = req.params.navio;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .paretoManutencao(id)
      .then((result) => {
        if (!result || result.length === 0) {
          return res.status(404).json({
            type: "error",
            message: "Nenhum dado encontrado para o navio.",
          });
        }

        const categorias = result.map((item) => item.resumo);
        const tempo = result.map((item) => item.tempo_total);

        res.status(200).json({
          type: "success",
          data: {
            categorias,
            tempo,
          },
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar dados do navio",
          error: error.message,
        })
      );
  }

  cascataEventos(req, res) {
    const id = req.params.navio;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .cascataEventos(id)
      .then((result) => {
        const mapa = {
          "CONDIÇÃO CLIMÁTICA": "CLIMA",
          DESCARREGANDO: "DESCARREGANDO",
          "MANUTENÇÃO CORRETIVA": "MAN CORRETIVA",
          "MANUTENÇÃO PREVENTIVA": "MAN PREVENTIVA",
          "PARADA OPERACIONAL": "PARADA OPERACIONAL",
        };

        const eventos = {
          CLIMA: 0,
          DESCARREGANDO: 0,
          "MAN CORRETIVA": 0,
          "MAN PREVENTIVA": 0,
          "PARADA OPERACIONAL": 0,
        };

        for (const item of result) {
          const nome = mapa[item.classificacao];
          if (nome && eventos.hasOwnProperty(nome)) {
            eventos[nome] = parseFloat(item.tempo_total) || 0;
          }
        }

        const total = Object.values(eventos).reduce((acc, val) => acc + val, 0);
        const eventosArray = Object.entries(eventos).map(([nome, tempo]) => ({
          nome,
          tempo,
        }));

        eventosArray.push({
          nome: "TOTAL",
          tempo: parseFloat(total.toFixed(2)),
        });

        res.status(200).json({
          type: "success",
          data: eventosArray,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar resumo de eventos",
          error: error.message,
        })
      );
  }

  corretivPreventiva(req, res) {
    const id = req.params.navio;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .corretivPreventiva(id)
      .then((dados) => {
        res.status(200).json({
          type: "success",
          data: dados,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar dados de manutenção",
          error: error.message,
        })
      );
  }
}

module.exports = new NavioController();
