const estoqueModel = require("../models/estoque");

class EstoqueController {
  async listarTodos(req, res) {
    try {
      const valores = await estoqueModel.buscarTodos();
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({ type: "error", message: "Erro ao buscar estoque", error: error.message });
    }
  }

  async listarDiario(req, res) {
    try {
      const valores = await estoqueModel.buscarDiario();
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({ type: "error", message: "Erro ao buscar estoque", error: error.message });
    }
  }

  async listarRealizado(req, res) {
    try {
      const valores = await estoqueModel.buscarRealizado();
      res.status(200).json({ type: "success", data: valores });
    } catch (error) {
      res.status(500).json({ type: "error", message: "Erro ao buscar estoque", error: error.message });
    }
  }

  async listarPorId(req, res) {
    const id = req.params.id;
    try {
      if (id === "1") {
        const valores = await estoqueModel.buscarUltimo();
        res.status(200).json({ type: "success", data: valores });
      } else {
        res.status(400).json({ type: "error", message: "ID inválido. Use /estoque para todos ou /estoque/1 para o último." });
      }
    } catch (error) {
      res.status(500).json({ type: "error", message: "Erro ao buscar estoque", error: error.message });
    }
  }
}

module.exports = new EstoqueController();
