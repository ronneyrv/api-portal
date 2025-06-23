const { Router } = require("express");
const estoqueController = require("../controllers/estoqueController");
const router = Router();

router.get("/estoque/diario", estoqueController.listar);

module.exports = router;
