const { Router } = require("express");
const TopController = require("../controllers/topController");
const router = Router();

router.get("/top/tarifa", TopController.listarTarifas);
router.get("/top/rateio/:periodo/:empresa", TopController.rateio);
router.get("/top/:ano", TopController.listarCompleto);

router.post("/top", TopController.adicionar);

router.put("/top", TopController.atualizar);
router.put("/top/rateio", TopController.atualizaRateio);
router.put("/top/tarifa", TopController.atualizaTarifa);

router.delete("/top/:id", TopController.deletar);

module.exports = router;
