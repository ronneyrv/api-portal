const navioModel = require("../models/navio");

const converterParaNumeroSQL = (valor) => {
  // if (valor === null || valor === undefined || valor.toString().trim() === "") {
  //   return null;
  // }
  // const valorLimpo = valor.toString().replace(/\./g, "").replace(",", ".");
  // return parseFloat(valorLimpo);


  if (valor === null || valor === undefined || valor.toString().trim() === "") {
    return null;
  }
  
  // 1. Converte para string e remove TODOS os pontos de milhar com o REGEX global /g
  const semSeparadorMilhar = valor.toString().replace(/\./g, "");
  
  // 2. Substitui a VÍRGULA decimal pelo PONTO decimal
  const valorLimpo = semSeparadorMilhar.replace(",", ".");
  
  // 3. Converte para número float
  return parseFloat(valorLimpo);
};

const converterParaUTC = (valor) => {
  if (!valor || typeof valor !== "string" || valor.trim() === "") {
    return null;
  }
  const dataStringUTC = `${valor.trim()}:00.000Z`;
  const data = new Date(dataStringUTC);

  if (isNaN(data.getTime())) {
    return null;
  }

  return data;
};

const converterDataDate = (valor) => {
  let valorString = valor;
  if (typeof valorString === "object" && valorString !== null) {
    valorString = String(valorString);
  }

  if (
    !valorString ||
    typeof valorString !== "string" ||
    valorString.trim() === ""
  ) {
    return null;
  }

  const indiceT = valorString.indexOf("T");

  if (indiceT === -1 || indiceT < 10) {
    return null;
  }

  return valorString.substring(0, indiceT);
};

class NavioController {
  async adicionar(req, res) {
    const { dados } = req.body;
    if (
      !dados.navio ||
      !dados.cliente ||
      !dados.atracacao ||
      !dados.inicio_op ||
      !dados.arqueacao_inicial
    ) {
      return res.status(400).json({
        type: "error",
        message: "Dados incompletos!",
      });
    }

    dados.atracacao = converterParaUTC(dados.atracacao);
    dados.inicio_op = converterParaUTC(dados.inicio_op);
    dados.arqueacao_inicial = converterParaNumeroSQL(dados.arqueacao_inicial);

    try {
      await navioModel.adicionar(dados);
      return res.status(200).json({
        type: "success",
        message: "Navio adicionado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao adicionar navio:", error);
      return res.status(500).json({
        type: "error",
        message: "Erro ao adicionar Navio",
        error: error.message,
      });
    }
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

  async listaConsolidados(req, res) {
    try {
      const lista = await navioModel.listaConsolidados();

      res.status(200).json({
        type: "success",
        data: lista,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista de ocorrências",
        error: error.message,
      });
    }
  }

  async navioConsolidado(req, res) {
    const navio = req.params.navio;
    try {
      const consolidado = await navioModel.navioConsolidado(navio);

      res.status(200).json({
        type: "success",
        data: consolidado,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar consolidado",
        error: error.message,
      });
    }
  }

  async previsaoFim(req, res) {
    try {
      const dadosNavio = await navioModel.obterDadosParaPrevisao();

      if (!dadosNavio || dadosNavio.taxa === 0) {
        return res.status(200).json({
          type: "success",
          message: "Nenhuma previsão de término a ser atualizada ou taxa zero.",
        });
      }

      const atracacao = new Date(dadosNavio.atracacao);
      const agora = new Date();
      const diferencaMsegundos = agora - atracacao;
      const diferencaDias = diferencaMsegundos / (1000 * 60 * 60 * 24);
      const diasCalculado = (
        diferencaDias +
        dadosNavio.saldo / (dadosNavio.taxa * 24)
      ).toFixed(2);

      await navioModel.atualizarDias(dadosNavio.navio, diasCalculado);

      res.status(200).json({
        type: "success",
        message: "Previsão de término atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar previsão:", error.message || error);
      res.status(500).json({
        type: "error",
        message: error.message || "Erro ao atualizar previsão.",
      });
    }
  }

  async atualizaMeta(req, res) {
    const { dados } = req.body;

    try {
      await navioModel.atualizaMeta(dados);

      if (dados.meta === "0.00") {
        return res.status(200).json({
          type: "error",
          message: "A prancha diária é iválido!",
        });
      }

      res.status(200).json({
        type: "success",
        message: "Plano e Meta atualizados",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao atualizar",
        error: error.message,
      });
    }
  }

  async atualizaArqueacao(req, res) {
    const { dados } = req.body;
    dados.arqueado = converterParaNumeroSQL(dados.arqueado);
    let taxaCalculada = 0;

    if (
      !dados.navio ||
      !dados.data ||
      !dados.atracado ||
      !dados.arqueacao ||
      !dados.arqueado ||
      !dados.tipoArqueacao ||
      dados.descarregado === null ||
      typeof dados.descarregado === "undefined" ||
      dados.arqueadoDia === null ||
      typeof dados.arqueadoDia === "undefined"
    ) {
      return res.status(200).json({
        type: "error",
        message: "Dados incompletos!",
      });
    }

    if (dados.arqueado <= dados.descarregado) {
      return res.status(200).json({
        type: "error",
        message: "Erro no valor da Arqueação!",
      });
    }

    if (dados.tipoArqueacao === "final") {
      return res.status(200).json({
        type: "info",
        message: "Revise o navio antes de finalizar!",
      });
    }

    if (dados.arqueado !== 0) {
      const atracacao = new Date(dados.atracado);
      const agora = new Date();
      const diferencaMsegundos = agora - atracacao;
      const diferencaDias = diferencaMsegundos / (1000 * 60 * 60 * 24);
      taxaCalculada = (dados.arqueado / diferencaDias / 24).toFixed(0);
    } else {
      taxaCalculada = 0;
    }

    const diferenca = dados.arqueado - dados.descarregado;
    const valorDoDia = dados.arqueadoDia + diferenca;

    dados.valorFinalDia = valorDoDia;
    dados.taxa = taxaCalculada;

    if (dados.arqueado > dados.arqueacao) {
      dados.saldo = 0;
    } else {
      dados.saldo = (
        dados.arqueacao -
        (dados.descarregado + diferenca)
      ).toFixed(3);
    }
    if (dados.tipoArqueacao === "00") {
      if (
        dados.pilha === "1A" ||
        dados.pilha === "1B" ||
        dados.pilha === "2A"
      ) {
        dados.cliente = "ENEVA";
      } else {
        dados.cliente = "ENERGIA PECÉM";
      }

      await navioModel.incrementoNavioPilha(dados);
    }

    try {
      await navioModel.atualizaArqueacao(dados);
      return res.status(200).json({
        type: "success",
        message: "Arqueação adicionada",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar",
        error: error.message,
      });
    }
  }

  async finalizar(req, res) {
    try {
      const { dados } = req.body;
      if (
        !dados.navio ||
        !dados.cliente ||
        !dados.carvao_tipo ||
        !dados.sistema ||
        !dados.atracacao ||
        !dados.desatracacao ||
        !dados.inicio_op ||
        !dados.fim_op ||
        !dados.arqueacao_inicial ||
        !dados.arqueacao_final
      ) {
        return res.status(400).json({
          type: "error",
          message: "Dados incompletos!",
        });
      }

      let finalOp = dados.fim_op;
      dados.nor = converterParaUTC(dados.nor);
      dados.atracacao = converterParaUTC(dados.atracacao);
      dados.desatracacao = converterParaUTC(dados.desatracacao);
      dados.inicio_op = converterParaUTC(dados.inicio_op);
      dados.fim_op = converterParaUTC(dados.fim_op);

      const arqueacaoFinal = converterParaNumeroSQL(dados.arqueacao_final);
      const arqueacaoInicial = converterParaNumeroSQL(dados.arqueacao_inicial);
      const atracacaoDate = new Date(dados.atracacao);
      const desatracacaoDate = new Date(dados.desatracacao);
      const diferencaMsegundos = desatracacaoDate - atracacaoDate;
      const dias = (diferencaMsegundos / (1000 * 60 * 60 * 24)).toFixed(2);
      const finalizado = true;

      const tempoOperacao = await navioModel.obterTempoOperacao(dados.navio);

      let taxaEfetiva = 0;
      let taxaComercial = 0;

      if (tempoOperacao > 0) {
        taxaEfetiva = (arqueacaoFinal / tempoOperacao).toFixed(0);
      }
      taxaComercial = (arqueacaoFinal / dias).toFixed(0);

      let diasOperando = (tempoOperacao / 24).toFixed(2);
      let ponderado = ((dias * 75000) / arqueacaoFinal).toFixed(2);
      let pranchaEfetiva = (arqueacaoFinal / ponderado).toFixed(0);

      let dataFinalizado = converterDataDate(finalOp);
      const { totalDescarregado, totalUltimoDia } =
        await navioModel.totalDescarregado(dados.navio, dataFinalizado);
      let navioFinalizado = dados.navio;
      let diferenca = arqueacaoFinal - totalDescarregado;
      let volumeFinalizado = (totalUltimoDia + diferenca).toFixed(3);

      await navioModel.finalArqueacao(
        navioFinalizado,
        dataFinalizado,
        volumeFinalizado
      );

      await navioModel.finalizar({
        ...dados,
        arqueacao_inicial: arqueacaoInicial,
        arqueacao_final: arqueacaoFinal,
        dias: dias,
        taxa: taxaComercial,
        taxa_efetiva: taxaEfetiva,
        finalizado: finalizado,
      });

      let metas = await navioModel.inforFinalNavio(dados.navio);

      if (!metas) {
        throw new Error(
          "Não foi possível obter informações finais (taxa/meta) do navio após a finalização."
        );
      }

      await navioModel.consolidar({
        numero_navio: null,
        navio: dados.navio,
        cliente: dados.cliente,
        sistema: dados.sistema,
        nor: dados.nor,
        atracacao: dados.atracacao,
        desatracacao: dados.desatracacao,
        inicio_operacao: dados.inicio_op,
        fim_operacao: dados.fim_op,
        dias_operando: diasOperando,
        dias_atracado: dias,
        dias_base_75k: ponderado,
        carga: arqueacaoFinal,
        produtividade: pranchaEfetiva,
        dias_de_demurrage: 0,
        valor_demurrage_USD: 0,
        demurrage_ou_despatch_aproximado: 0,
        carvao_tipo: dados.carvao_tipo,
        taxa_comercial: metas.taxa,
        taxa_efetiva: metas.taxa_efetiva,
        meta: metas.meta,
        observacao: null,
      });

      return res.status(200).json({
        type: "success",
        message: "Navio finalizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao finalizar navio:", error.message || error);
      return res.status(500).json({
        type: "error",
        message: error.message || "Erro ao finalizar navio",
      });
    }
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

  buscarOciosidade(req, res) {
    navioModel
      .buscarOciosidade()
      .then((ocioso) => {
        res.status(200).json({
          type: "success",
          data: ocioso,
        });
      })
      .catch((error) => {
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar berço ocioso",
          error: error.message,
        });
      });
  }

  ocorrenciasNavioAtracado(req, res) {
    const navio = req.params.navio;

    if (!navio || typeof navio !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .ocorrenciasNavioAtracado(navio)
      .then((navio) => {
        if (!navio || navio.length === 0) {
          return res.status(200).json({
            type: "info",
            message: "Navio sem ocorrência.",
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

  async buscarTopOpe(req, res) {
    try {
      const { navio } = req.params;
      const especialidade = "OPERAÇÃO";
      const classificacaoExcluida = "DESCARREGANDO";

      const lista = await navioModel.buscarTopOpe(
        navio,
        especialidade,
        classificacaoExcluida
      );

      res.status(200).json({
        type: "success",
        data: lista,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista TOP10 operação",
        error: error.message,
      });
    }
  }

  async buscarTopMan(req, res) {
    try {
      const { navio } = req.params;

      const lista = await navioModel.buscarTopMan(navio);

      res.status(200).json({
        type: "success",
        data: lista,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista TOP10 manutenção",
        error: error.message,
      });
    }
  }

  buscarOcorrenciaGeral(req, res) {
    navioModel
      .buscarOcorrenciaGeral()
      .then((ocorrencias) => {
        if (!ocorrencias || ocorrencias.length === 0) {
          return res.status(200).json({
            type: "error",
            message: "Ocorrências não localizadas",
          });
        }

        res.status(200).json({
          type: "success",
          data: ocorrencias,
        });
      })
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao buscar ocorrências",
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
    dados.ocorrencia = dados.ocorrencia.toLocaleUpperCase("pt-BR");

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

  async buscarLista(req, res) {
    try {
      const lista = await navioModel.buscarLista();

      if (!lista || Object.keys(lista).length === 0) {
        return res.status(200).json({
          type: "error",
          message: "Nenhuma lista encontrada",
        });
      }

      res.status(200).json({
        type: "success",
        data: lista,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista de ocorrências",
        error: error.message,
      });
    }
  }

  async buscarUltima(req, res) {
    try {
      const ultimaOcorrencia = await navioModel.buscarUltima();

      res.status(200).json({
        type: "success",
        data: ultimaOcorrencia,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar a última ocorrência",
        error: error.message,
      });
    }
  }

  async adicionarOcorrencia(req, res) {
    const { dados } = req.body;

    if (
      !dados.navio ||
      !dados.cliente ||
      !dados.inicio ||
      !dados.fim ||
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
        message: "Dados obrigatórios.",
      });
    }
    if (dados.inicio >= dados.fim) {
      return res.status(400).json({
        type: "error",
        message: "Erro na data fim.",
      });
    }
    dados.ocorrencia = dados.ocorrencia.toLocaleUpperCase("pt-BR");
    const inicioLocal = dados.inicio;
    const fimLocal = dados.fim;
    dados.inicio = new Date(inicioLocal + ":00.000Z");
    dados.fim = new Date(fimLocal + ":00.000Z");
    const diferenca = dados.fim.getTime() - dados.inicio.getTime();
    const tempoEmHoras = diferenca / (1000 * 60 * 60);
    dados.tempo = parseFloat(tempoEmHoras.toFixed(2));
    dados.inicio = dados.inicio.toISOString();
    dados.fim = dados.fim.toISOString();

    if (dados.tempo > 12) {
      return res.status(400).json({
        type: "error",
        message: "Ocorrência maior que 12h",
      });
    }
    navioModel
      .adicionarOcorrencia(dados)
      .then(() =>
        res.status(200).json({
          type: "success",
          message: "Ocorrência adicionada com sucesso",
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao adicionar ocorrência",
          error: error.message,
        })
      );
  }

  async adicionarPlano(req, res) {
    const { dados } = req.body;

    if (!dados || !Array.isArray(dados)) {
      return res.status(400).json({
        type: "error",
        message: "Dados do plano de descarga não foram fornecidos.",
      });
    }

    try {
      for (const item of dados) {
        const dadosLimpos = {
          navio: item.navio,
          data: new Date(item.data),
          planejado: converterParaNumeroSQL(item.planejado),
          realizado: converterParaNumeroSQL(item.realizado),
        };
        await navioModel.adicionarPlano(dadosLimpos);
      }

      res.status(200).json({
        type: "success",
        message: "Plano de descarga adicionado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao adicionar Plano:", error);
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar Plano",
        error: error.message,
      });
    }
  }

  async atualizarOcorrencia(req, res) {
    const { dados } = req.body;

    if (!dados.id) {
      return res.status(400).json({
        type: "error",
        message: "ID da ocorrência é obrigatório para atualização.",
      });
    }

    if (
      !dados.navio ||
      !dados.cliente ||
      !dados.inicio ||
      !dados.fim ||
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
        message: "Dados obrigatórios.",
      });
    }
    if (dados.inicio >= dados.fim) {
      return res.status(400).json({
        type: "error",
        message: "Erro na data fim.",
      });
    }
    dados.ocorrencia = dados.ocorrencia.toLocaleUpperCase("pt-BR");
    const inicioLocal = dados.inicio;
    const fimLocal = dados.fim;
    dados.inicio = new Date(inicioLocal + ":00.000Z");
    dados.fim = new Date(fimLocal + ":00.000Z");
    const diferenca = dados.fim.getTime() - dados.inicio.getTime();
    const tempoEmHoras = diferenca / (1000 * 60 * 60);
    dados.tempo = parseFloat(tempoEmHoras.toFixed(2));
    dados.inicio = dados.inicio.toISOString();
    dados.fim = dados.fim.toISOString();

    navioModel
      .atualizarOcorrencia(dados)
      .then(() =>
        res.status(200).json({
          type: "success",
          message: "Ocorrência atualizada com sucesso.",
        })
      )
      .catch((error) =>
        res.status(500).json({
          type: "error",
          message: "Erro ao atualizar a ocorrência.",
          error: error.message,
        })
      );
  }

  async buscarPlano(req, res) {
    const navio = req.params.navio;

    if (!navio || typeof navio !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    try {
      const plano = await navioModel.buscarPlano(navio);

      if (!plano || plano.length === 0) {
        return res.status(200).json({
          type: "info",
          message: `Nenhum plano encontrado para o navio ${navio}`,
        });
      }
      const datas = plano.map((item) => {
        const data = new Date(item.data);
        const dia = String(data.getUTCDate()).padStart(2, "0");
        const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
        return `${dia}/${mes}`;
      });

      const planejado = plano.map((item) => item.planejado);
      const realizado = plano.map((item) => item.realizado);

      const planoDeDescarga = {
        datas,
        planejado,
        realizado,
      };

      res.status(200).json({
        type: "success",
        data: planoDeDescarga,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar plano do navio",
        error: error.message,
      });
    }
  }

  async buscarArqueacoes(req, res) {
    const navio = req.params.navio;
    const { data } = req.query;

    if (!navio || typeof navio !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    try {
      const { totalDescarregado, totalUltimoDia } =
        await navioModel.totalDescarregado(navio, data);
      return res.status(200).json({
        type: "success",
        descarregado: totalDescarregado,
        ultimoDia: totalUltimoDia,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar arqueações",
        error: error.message,
      });
    }
  }

  paretoOperacao(req, res) {
    const navio = req.params.navio;

    if (!navio || typeof navio !== "string") {
      return res.status(400).json({
        type: "error",
        message: "Navio inválido.",
      });
    }

    navioModel
      .paretoOperacao(navio)
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
