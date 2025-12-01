const estoqueModel = require("../models/estoque");

const converterParaNumeroSQL = (valor) => {
  let strValor = String(valor);
  if (strValor.includes(",")) {
    strValor = strValor.replace(/\./g, "").replace(",", ".");
  }
  if (typeof valor === "string") {
    if (strValor.includes(",")) {
      strValor = strValor.replace(/\./g, "").replace(",", ".");
    } else if (strValor.includes(".")) {
      strValor = strValor.replace(/\./g, "");
    }
  }
  const numero = parseFloat(strValor);
  return isNaN(numero) ? 0 : numero;
};

class EstoqueController {
  async listarTodos(req, res) {
    try {
      const valores = await estoqueModel.buscarTodos();
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar estoque",
        error: error.message,
      });
    }
  }

  async listarDiario(req, res) {
    try {
      const valores = await estoqueModel.buscarDiario();
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar estoque",
        error: error.message,
      });
    }
  }

  async listarRealizado(req, res) {
    try {
      const valores = await estoqueModel.buscarRealizado();
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar estoque",
        error: error.message,
      });
    }
  }

  async listarPorPilha(req, res) {
    try {
      const valores = await estoqueModel.listarPorPilha();
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar estoque por pilha",
        error: error.message,
      });
    }
  }

  async listarPorPilhaId(req, res) {
    const id = req.params.id;
    try {
      const valores = await estoqueModel.listarPorPilhaId(id);
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar navios por pilha",
        error: error.message,
      });
    }
  }

  async listarPorId(req, res) {
    const id = req.params.id;
    try {
      const valores = await estoqueModel.listarPorId(id);
      res.status(200).json({
        type: "success",
        data: valores,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar estoque",
        error: error.message,
      });
    }
  }

  async listarConfig(req, res) {
    try {
      const config = await estoqueModel.listarConfig();
      res.status(200).json({
        type: "success",
        data: config,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar configuração",
        error: error.message,
      });
    }
  }

  async adicionarConsumo(req, res) {
    const { dados } = req.body;

    if (!dados.data) {
      return res.status(400).json({
        type: "error",
        message: "Data obrigatória.",
      });
    }
    if (dados.ajuste_ep && !dados.comentario) {
      return res.status(400).json({
        type: "error",
        message: "Adicione um comentário",
      });
    }

    const existe = await estoqueModel.seExiste(dados.data);

    if (existe) {
      return res.status(400).json({
        type: "error",
        message: "Já existe consumo na data informada!",
      });
    }

    dados.consumo_ug1 = converterParaNumeroSQL(dados.consumo_ug1);
    dados.consumo_ug2 = converterParaNumeroSQL(dados.consumo_ug2);
    dados.consumo_ug3 = converterParaNumeroSQL(dados.consumo_ug3);
    dados.ajuste_ep = converterParaNumeroSQL(dados.ajuste_ep);
    dados.ajuste_eneva = converterParaNumeroSQL(dados.ajuste_eneva);
    dados.tcld_ep = converterParaNumeroSQL(dados.tcld_ep);
    dados.tcld_eneva = converterParaNumeroSQL(dados.tcld_eneva);
    dados.rodoviario_ep = converterParaNumeroSQL(dados.rodoviario_ep);
    dados.rodoviario_eneva = converterParaNumeroSQL(dados.rodoviario_eneva);
    dados.emprestimo_ep = converterParaNumeroSQL(dados.emprestimo_ep);
    dados.emprestimo_eneva = converterParaNumeroSQL(dados.emprestimo_eneva);

    if (dados.comentario) {
      dados.comentario = dados.comentario.toLocaleUpperCase("pt-BR");
    }

    const estocado = await estoqueModel.buscarRealizado();
    const consumoCargaBase = await estoqueModel.consumoEmCarga("base");
    const consumoBaseUG1 = consumoCargaBase[0].consumo;
    const consumoBaseUG2 = consumoCargaBase[1].consumo;
    const consumoBaseUG3 = consumoCargaBase[2].consumo;

    const entradas_ep =
      dados.ajuste_ep +
      dados.tcld_ep +
      dados.rodoviario_ep +
      dados.emprestimo_ep;
    const saidas_ep = dados.consumo_ug1 + dados.consumo_ug2;

    const entradas_eneva =
      dados.ajuste_eneva +
      dados.tcld_eneva +
      dados.rodoviario_eneva +
      dados.emprestimo_eneva;
    const saidas_eneva = dados.consumo_ug3;

    dados.volume_ep = estocado[0].volume_ep + entradas_ep - saidas_ep;
    dados.volume_eneva =
      estocado[0].volume_eneva + entradas_eneva - saidas_eneva;
    dados.volume_conjunto = dados.volume_ep + dados.volume_eneva;

    dados.dia_ep = Math.floor(
      dados.volume_ep / (consumoBaseUG1 + consumoBaseUG2)
    );
    dados.dia_eneva = Math.floor(dados.volume_eneva / consumoBaseUG3);
    dados.dia_conjunto = Math.floor(
      dados.volume_conjunto / (consumoBaseUG1 + consumoBaseUG2 + consumoBaseUG3)
    );

    estoqueModel
      .adicionarConsumo(dados)
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

  async atualizarConfig(req, res) {
    const { dados } = req.body;
    try {
      await estoqueModel.atualizarConfig(dados);
      return res.status(200).json({
        type: "success",
        message: "Consumo configurado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      res.status(500).json({
        type: "error",
        message: "Erro ao atualizar a configuração.",
        error: error.message,
      });
    }
  }

  async atualizarEstoque(req, res) {
    const { dados } = req.body;
    const id = dados ? dados.id : null;

    if (!dados || Object.keys(dados).length === 0 || !id) {
      return res.status(200).json({
        type: "error",
        message: "Dados inválidos ou vazios (ID é obrigatório).",
      });
    }

    try {
      dados.consumo_ug1 = converterParaNumeroSQL(dados.consumo_ug1);
      dados.consumo_ug2 = converterParaNumeroSQL(dados.consumo_ug2);
      dados.consumo_ug3 = converterParaNumeroSQL(dados.consumo_ug3);
      dados.ajuste_ep = converterParaNumeroSQL(dados.ajuste_ep);
      dados.ajuste_eneva = converterParaNumeroSQL(dados.ajuste_eneva);
      dados.tcld_ep = converterParaNumeroSQL(dados.tcld_ep);
      dados.tcld_eneva = converterParaNumeroSQL(dados.tcld_eneva);
      dados.rodoviario_ep = converterParaNumeroSQL(dados.rodoviario_ep);
      dados.rodoviario_eneva = converterParaNumeroSQL(dados.rodoviario_eneva);
      dados.emprestimo_ep = converterParaNumeroSQL(dados.emprestimo_ep);
      dados.emprestimo_eneva = converterParaNumeroSQL(dados.emprestimo_eneva);
      dados.volume_ep = converterParaNumeroSQL(dados.volume_ep);
      dados.volume_eneva = converterParaNumeroSQL(dados.volume_eneva);
      dados.volume_conjunto = converterParaNumeroSQL(dados.volume_conjunto);
      dados.dia_ep = converterParaNumeroSQL(dados.dia_ep);
      dados.dia_eneva = converterParaNumeroSQL(dados.dia_eneva);
      dados.dia_conjunto = converterParaNumeroSQL(dados.dia_conjunto);

      await estoqueModel.atualizarEstoque(dados);

      // loop para recalcular e atualizar as linhas subsequentes
      const atualizacoes = await estoqueModel.loopAtualizaEstoque(id);

      const message =
        typeof atualizacoes === "number" && atualizacoes > 0
          ? `Estoque atualizado com sucesso. ${atualizacoes} linha(s) recalculada(s).`
          : "Estoque atualizado, mas nenhuma linha subsequente precisou de recálculo.";

      return res.status(200).json({
        type: "success",
        message: message,
      });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      res.status(500).json({
        type: "error",
        message: "Erro ao atualizar o estoque.",
        error: error.message,
      });
    }
  }

  async atualizarPorPilha(req, res) {
    const dados = req.body;

    if (!dados || dados.length === 0) {
      return res.status(200).json({
        type: "error",
        message: "Dados inválidos ou vazios.",
      });
    }

    try {
      await estoqueModel.atualizarPorPilha(dados);

      res.status(200).json({
        type: "success",
        message: "Estoque navio atualizado com sucesso.",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao atualizar",
        error: error.message,
      });
    }
  }
}

module.exports = new EstoqueController();
