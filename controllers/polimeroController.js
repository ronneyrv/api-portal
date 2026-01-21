const polimeroModel = require("../models/polimero");

const converterParaNumeroSQL = (valor) => {
  if (valor === null || valor === undefined || valor.toString().trim() === "") {
    return null;
  }
  const valorLimpo = valor.toString().replace(/\./g, "").replace(",", ".");
  return parseFloat(valorLimpo);
};

const getCliente = (pilha) => {
  switch (pilha) {
    case "1A":
    case "1B":
    case "2A":
    case "ENEVA":
      return "ENEVA";
    case "2B":
    case "2C":
    case "2D":
    case "3A":
    case "3B":
    case "EP":
      return "EP";
    default:
      return null;
  }
};

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

  lista(req, res) {
    polimeroModel
      .lista()
      .then((lista) =>
        res.status(200).json({
          type: "success",
          data: lista,
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

  async pilhaVazia(req, res) {
    try {
      const pilhas = await polimeroModel.pilhaVazia();

      res.status(200).json({
        type: "success",
        data: pilhas,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar pilhas",
        error: error.message,
      });
    }
  }

  async adicionar(req, res) {
    const { dados } = req.body;

    if (
      !dados.data ||
      !dados.tipo ||
      !dados.volume ||
      !dados.pilha ||
      !dados.responsavel
    ) {
      return res
        .status(200)
        .json({ type: "error", message: "Dados obrigatórios faltando!" });
    }

    dados.volume = converterParaNumeroSQL(dados.volume);
    dados.responsavel = dados.responsavel.toUpperCase();
    dados.observacao = dados.observacao ? dados.observacao.toUpperCase() : null;

    const cliente = getCliente(dados.pilha);
    if (!cliente) {
      return res
        .status(200)
        .json({ type: "error", message: "Pilha inválida fornecida." });
    }

    try {
      await polimeroModel.adicionarComTransacao(dados, cliente);

      return res.status(200).json({
        type: "success",
        message: "Adicionado com sucesso e estoque atualizado.",
      });
    } catch (error) {
      console.error("Erro no controller adicionar:", error);
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar. Transação desfeita.",
        error: error.message,
      });
    }
  }

  async atualizar(req, res) {
    const { id } = req.params;
    const { dados } = req.body;

    if (!id || !dados) {
      return res.status(400).json({
        type: "error",
        message: "ID ou dados para atualização ausentes!",
      });
    }

    dados.volume = converterParaNumeroSQL(dados.volume);
    dados.responsavel = dados.responsavel.toUpperCase();
    dados.observacao = dados.observacao ? dados.observacao.toUpperCase() : null;

    const clienteNovo = getCliente(dados.pilha);
    if (!clienteNovo) {
      return res.status(200).json({
        type: "error",
        message: "Pilha fornecida na atualização inválida.",
      });
    }

    try {
      const registroAntigo = await polimeroModel.buscarPorId(id);

      if (!registroAntigo) {
        return res.status(200).json({
          type: "error",
          message: `Registro ID não encontrado para atualização.`,
        });
      }

      const clienteAntigo = getCliente(registroAntigo.pilha);

      if (!clienteAntigo) {
        throw new Error(
          "Cliente antigo não pôde ser determinado. Problema na base de dados."
        );
      }

      const result = await polimeroModel.atualizarComTransacao(
        id,
        dados,
        registroAntigo,
        clienteAntigo,
        clienteNovo
      );

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(404).json({
          type: "error",
          message: `Registro ID ${id} não afetado. Verifique o ID.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Registro atualizado com sucesso. Estoque compensado.`,
      });
    } catch (error) {
      console.error("Erro no controller atualizar:", error);
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar. Transação desfeita.`,
        error: error.message,
      });
    }
  }

  async atualizaPilhaVazia(req, res) {
    const { pilha } = req.params;

    if (!pilha) {
      return res.status(200).json({
        type: "error",
        message: "Pilha para atualização ausente",
      });
    }

    try {
      await polimeroModel.atualizaPilhaVazia(pilha);

      return res.status(200).json({
        type: "success",
        message: `Pilha ${pilha} zerada com sucesso`,
      });
    } catch (error) {
      console.error("Erro no controller atualizar:", error);
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar. Transação desfeita.`,
        error: error.message,
      });
    }
  }
}
module.exports = new PolimeroController();
