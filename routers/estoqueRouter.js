const { Router } = require("express");
const estoqueController = require("../controllers/estoqueController");
const router = Router();

router.get("/estoque", estoqueController.listarTodos);
router.get("/estoque/diario", estoqueController.listarDiario);
router.get("/estoque/realizado", estoqueController.listarRealizado);
router.get("/estoque/por/pilha", estoqueController.listarPorPilha);
router.get("/estoque/:id", estoqueController.listarPorId);
module.exports = router;
