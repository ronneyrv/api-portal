const pdfModel = require("../models/pdfModel");

class PdfController {
  async gerar(req, res) {
    const { html } = req.body;

    try {
      if (!html) {
        return res
          .status(404)
          .json({ type: "error", message: "HTML não fornecido." });
      }

      const pdfBuffer = await pdfModel.gerar(html);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=relatorio.pdf",
      });
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Erro ao criar usuário:", error.message || error);
      res.status(400).json({
        type: "error",
        message: error.message || "Erro ao criar usuário",
      });
    }
  }
}

module.exports = new PdfController();
