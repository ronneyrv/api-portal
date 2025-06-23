const { Router } = require("express");
const observacaoController = require("../controllers/observacaoController");
const router = Router();

router.get("/observacoes/rot", observacaoController.listar);
router.put("/observacoes/rot", observacaoController.atualizar);
router.get("/eventos/andamento/rot", observacaoController.listarEvento);
router.put("/eventos/andamento/rot", observacaoController.atualizarEvento);

module.exports = router;