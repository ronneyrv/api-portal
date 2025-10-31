const retomaModel = require("../models/retoma");

const converterParaNumeroSQL = (valor) => {
  if (valor === null || valor === undefined || valor.toString().trim() === "") {
    return null;
  }
  const valorLimpo = valor.toString().replace(/\./g, "").replace(",", ".");
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

class RetomaController {
  async listar(req, res) {
    try {
      const lista = await retomaModel.listarTudo();

      res.status(200).json({
        type: "success",
        data: lista,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar lista",
        error: error.message,
      });
    }
  }

  async listarTurno(req, res) {
    const { data, turno } = req.body;

    if (!data || !turno) {
      return res
        .status(400)
        .json({ type: "error", message: "Data ou turno não definidos!" });
    }

    try {
      const retomado = await retomaModel.listar(data, turno);

      if (retomado.length === 0) {
        return res.status(200).json({
          type: "info",
          message: "Sem retoma no turno.",
        });
      }

      res.status(200).json({
        type: "success",
        data: retomado,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar retoma",
        error: error.message,
      });
    }
  }

  async adicionar(req, res) {
    const { dados } = req.body;

    if (!dados.data || !dados.turno) {
      return res
        .status(400)
        .json({ type: "error", message: "Data ou turno não definidos!" });
    }

    dados.inicio = converterParaUTC(dados.inicio);
    dados.fim = converterParaUTC(dados.fim);
    dados.volume = converterParaNumeroSQL(dados.volume);
    try {
      await retomaModel.adicionar(dados);
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

  async atualizar(req, res) {
    const { id } = req.params;
    const { dados } = req.body;

    if (!dados) {
      return res
        .status(200)
        .json({
          type: "error",
          message:
            "Erro nos dados para atualização!",
        });
    }

    dados.volume = converterParaNumeroSQL(dados.volume);

    try {
      const result = await retomaModel.atualizar(id, dados);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Registro não encontrado para atualização.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Registro atualizado com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar`,
        error: error.message,
      });
    }
  }

  async deletar(req, res) {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ type: "error", message: "ID inválido ou não fornecido." });
    }

    try {
      const result = await retomaModel.deletar(id);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(404).json({
          type: "error",
          message: `Registro não encontrado.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Deletado com sucesso.`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao deletar o registro.",
        error: error.message,
      });
    }
  }
}

module.exports = new RetomaController();
