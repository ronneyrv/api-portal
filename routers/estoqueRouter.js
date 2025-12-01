const { Router } = require("express");
const estoqueController = require("../controllers/estoqueController");
const router = Router();

router.get("/estoque", estoqueController.listarTodos);
router.get("/estoque/diario", estoqueController.listarDiario);
router.get("/estoque/realizado", estoqueController.listarRealizado);
router.get("/config/consumo", estoqueController.listarConfig);
router.get("/estoque/por/pilha", estoqueController.listarPorPilha);

router.get("/estoque/navio/pilha/:id", estoqueController.listarPorPilhaId);
router.get("/estoque/:id", estoqueController.listarPorId);

router.post("/estoque/consumo", estoqueController.adicionarConsumo);

router.put("/config/consumo", estoqueController.atualizarConfig);
router.put("/estoque/consumo", estoqueController.atualizarEstoque);
router.put("/estoque/navio/pilha", estoqueController.atualizarPorPilha);

module.exports = router;
