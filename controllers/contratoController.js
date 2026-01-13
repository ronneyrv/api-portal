const contratoModel = require("../models/contrato");

const converterParaNumeroSQL = (valor) => {
  if (valor === null || valor === undefined || valor.toString().trim() === "") {
    return null;
  }
  const valorLimpo = valor.toString().replace(/\./g, "").replace(",", ".");
  return parseFloat(valorLimpo);
};

class ContratoController {
  async listar(req, res) {
    try {
      const lista = await contratoModel.listar();

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

  async orcamentoAnual(req, res) {
    try {
      const orcamento = await contratoModel.orcamentoAnual();

      res.status(200).json({
        type: "success",
        data: orcamento,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar orçamento anual",
        error: error.message,
      });
    }
  }

  async infoPainel(req, res) {
    const { contrato } = req.params;
    try {
      const data = await contratoModel.infoPainel(contrato);
      const { contratoInfo, medicoes, acumulado, orcamentos } = data;
      const isPPTM = contratoInfo.tipo === "PPTM";
      const realizadoTotal = medicoes.reduce(
        (acc, curr) => acc + curr.valor,
        0
      );
      const dadosAnuais = {};

      medicoes.forEach((item) => {
        if (!dadosAnuais[item.ano]) {
          dadosAnuais[item.ano] = {
            orcamento: { orcado: 0, realizado: 0 },
            anual_realizado: new Array(12).fill(0),
            anual_orcado: new Array(12).fill(0),
          };
        }
        dadosAnuais[item.ano].anual_realizado[item.mes - 1] += item.valor;
        isPPTM ? (dadosAnuais[item.ano].orcamento.realizado += item.valor) : 0;
      });

      if (isPPTM) {
        orcamentos.forEach((item) => {
          if (!dadosAnuais[item.ano]) {
            dadosAnuais[item.ano] = {
              orcamento: { orcado: 0, realizado: 0 },
              anual_realizado: new Array(12).fill(0),
              anual_orcado: new Array(12).fill(0),
            };
          }
          dadosAnuais[item.ano].anual_orcado[item.mes - 1] += item.orcado;
          dadosAnuais[item.ano].orcamento.orcado += item.orcado;
        });
      }

      Object.keys(dadosAnuais).forEach((ano) => {
        dadosAnuais[ano].anual_realizado = dadosAnuais[ano].anual_realizado.map(
          (v) => (v === 0 ? null : v)
        );
        dadosAnuais[ano].anual_orcado = dadosAnuais[ano].anual_orcado.map((v) =>
          v === 0 ? null : v
        );
      });
      // Resposta Final
      const projecao = {
        contratado: {
          previsto: parseFloat(
            contratoInfo.previsto_contratado?.toFixed(2) || 0
          ),
          realizado: parseFloat(realizadoTotal.toFixed(2) || 0),
        },
        acumulado: {
          orcado: acumulado?.orcado || 0,
          realizado: acumulado?.realizado || 0,
          ano: acumulado?.ano || new Date().getFullYear(),
        },
        dadosAnuais: dadosAnuais,
      };

      res.status(200).json({
        type: "success",
        data: projecao,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao processar painel",
        error: error.message,
      });
    }
  }

  async previsaoContrato(req, res) {
    const { ano, contrato } = req.params;
    try {
      const projecao = await contratoModel.previsaoContrato(ano, contrato);

      if (projecao.length === 0) {
        return res
          .status(200)
          .json({ type: "error", message: "Contrato não encontrado" });
      }

      res.status(200).json({
        type: "success",
        data: projecao,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista de ocorrências",
        error: error.message,
      });
    }
  }

  async contrato(req, res) {
    const { status, tipo } = req.params;
    try {
      const fornecedor = await contratoModel.contrato(status, tipo);

      if (fornecedor.length === 0) {
        return res
          .status(200)
          .json({ type: "error", message: "Fornecedor não encontrado" });
      }

      res.status(200).json({
        type: "success",
        data: fornecedor,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista de fornecedores",
        error: error.message,
      });
    }
  }

  async listarMedicoes(req, res) {
    const { ano } = req.params;
    try {
      const medicao = await contratoModel.listarMedicoes(ano);

      if (medicao.length === 0) {
        return res.status(200).json({
          type: "info",
          message: `Nenhuma medição encontrada para o ano ${ano}`,
        });
      }
      res.status(200).json({
        type: "success",
        data: medicao,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista de ocorrências",
        error: error.message,
      });
    }
  }

  async adicionar(req, res) {
    const { dados } = req.body;
    if (
      !dados.contrato ||
      !dados.fornecedor ||
      !dados.tipo ||
      !dados.inicio ||
      !dados.vigencia ||
      !dados.valor_contrato
    ) {
      return res
        .status(400)
        .json({ type: "error", message: "Há campos não definidos!" });
    }

    dados.contrato = dados.contrato.toLocaleUpperCase("pt-BR");
    dados.fornecedor = dados.fornecedor.toLocaleUpperCase("pt-BR");
    dados.valor_contrato = converterParaNumeroSQL(dados.valor_contrato);

    try {
      await contratoModel.adicionar(dados);
      return res.status(200).json({
        type: "success",
        message: "Adicionado com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar",
        error: error.message,
      });
    }
  }

  async adicionarMedicao(req, res) {
    const { dados } = req.body;
    if (
      !dados.contrato ||
      !dados.fornecedor ||
      !dados.descricao ||
      !dados.valor ||
      !dados.status_medicao ||
      !dados.mes ||
      !dados.ano
    ) {
      return res.status(200).json({
        type: "error",
        message: "Há campos obrigatórios não definidos!",
      });
    }

    if (dados.frs_migo) {
      dados.frs_migo = dados.frs_migo.toLocaleUpperCase("pt-BR");
    }

    dados.descricao = dados.descricao.toLocaleUpperCase("pt-BR");
    dados.valor = converterParaNumeroSQL(dados.valor);
    dados.mes = converterParaNumeroSQL(dados.mes);
    dados.ano = converterParaNumeroSQL(dados.ano);

    try {
      await contratoModel.medicao(dados);
      return res.status(200).json({
        type: "success",
        message: "Medição adicionada com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar medicao",
        error: error.message,
      });
    }
  }

  async adicionarProvisao(req, res) {
    const { dados } = req.body;
    if (!dados.contrato || !dados.fornecedor || !dados.ano) {
      return res.status(200).json({
        type: "error",
        message: "Há campos obrigatórios não definidos!",
      });
    }

    try {
      const promises = [];
      const anoFormatado = parseInt(dados.ano);
      for (let i = 1; i <= 12; i++) {
        const chaveOrcado = `orcado_${i}`;
        const chaveRealizado = `realizado_${i}`;
        const provisaoMes = {
          mes: i,
          ano: anoFormatado,
          contrato: dados.contrato,
          fornecedor: dados.fornecedor,
          orcado: converterParaNumeroSQL(dados[chaveOrcado]),
          realizado: converterParaNumeroSQL(dados[chaveRealizado]),
        };

        promises.push(contratoModel.provisao(provisaoMes));
      }

      await Promise.all(promises);

      return res.status(200).json({
        type: "success",
        message: "Provisões adicionadas com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar provisão",
        error: error.message,
      });
    }
  }

  async atualizar(req, res) {
    const { dados } = req.body;
    if (!dados) {
      return res.status(200).json({
        type: "error",
        message: "Erro nos dados para atualização!",
      });
    }
    dados.contrato = dados.contrato.toLocaleUpperCase("pt-BR");
    dados.fornecedor = dados.fornecedor.toLocaleUpperCase("pt-BR");
    dados.valor_contrato = converterParaNumeroSQL(dados.valor_contrato);

    try {
      const result = await contratoModel.atualizar(dados);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Contrato não atualizado.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Contrato atualizado com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar contrato`,
        error: error.message,
      });
    }
  }

  async atualizarMedicao(req, res) {
    const { dados } = req.body;
    if (!dados) {
      return res.status(200).json({
        type: "error",
        message: "Erro nos dados para medição!",
      });
    }
    dados.contrato = dados.contrato.toLocaleUpperCase("pt-BR");
    dados.fornecedor = dados.fornecedor.toLocaleUpperCase("pt-BR");
    dados.descricao = dados.descricao.toLocaleUpperCase("pt-BR");
    dados.valor = converterParaNumeroSQL(dados.valor);

    try {
      const result = await contratoModel.atualizarMedicao(dados);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Medição não atualizada.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Medição atualizada com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar medição`,
        error: error.message,
      });
    }
  }

  async atualizarMedicaoStatus(req, res) {
    const { dados } = req.body;
    if (!dados) {
      return res.status(200).json({
        type: "error",
        message: "Erro nos dados de status medição!",
      });
    }
    dados.contrato = dados.contrato.toLocaleUpperCase("pt-BR");
    dados.fornecedor = dados.fornecedor.toLocaleUpperCase("pt-BR");
    dados.descricao = dados.descricao.toLocaleUpperCase("pt-BR");
    dados.valor = converterParaNumeroSQL(dados.valor);

    try {
      const result = await contratoModel.atualizarMedicaoStatus(dados);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Status da Medição não atualizada.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Status da Medição atualizado com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar status da medição`,
        error: error.message,
      });
    }
  }

  async atualizarOrcamentoAnual(req, res) {
    const { dados } = req.body;

    if (!dados.ano || !dados.orcado || !dados.realizado) {
      return res.status(200).json({
        type: "error",
        message: "Dados incompletos para atualizar orçamento anual.",
      });
    }

    dados.orcado = converterParaNumeroSQL(dados.orcado);
    dados.realizado = converterParaNumeroSQL(dados.realizado);

    try {
      await contratoModel.atualizarOrcamentoAnual(dados);

      return res.status(200).json({
        type: "success",
        message: `Orçamento atualizado com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar orçamento`,
        error: error.message,
      });
    }
  }

  async encerrar(req, res) {
    const { dados } = req.body;
    if (!dados.id) {
      return res.status(200).json({
        type: "error",
        message: "Contrato não encontrado.",
      });
    }

    try {
      const result = await contratoModel.encerrar(dados);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Contrato não encontrado para encerramento.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Contrato encerrado com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao encerrar contrato`,
        error: error.message,
      });
    }
  }

  async reajuste(req, res) {
    const { dados } = req.body;
    if (!dados.id) {
      return res.status(200).json({
        type: "error",
        message: "Contrato não encontrado.",
      });
    }

    try {
      const result = await contratoModel.reajuste(dados);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Contrato não encontrado para reajuste.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Nova data de reajuste cadastrada com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao reajustar contrato`,
        error: error.message,
      });
    }
  }
}

module.exports = new ContratoController();
