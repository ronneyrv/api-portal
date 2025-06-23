const { Router } = require("express");
const pdfController = require("../controllers/pdfController");
const router = Router();

router.post("/gerar-pdf", pdfController.gerar);

module.exports = router;
