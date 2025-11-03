const { Router } = require("express");
const polimeroController = require("../controllers/polimeroController");
const router = Router();

router.get("/polimero", polimeroController.condicao);
router.get("/polimero/volume", polimeroController.volume);
router.get("/polimero/aplicacao", polimeroController.lista);

router.post("/polimero/adicionar", polimeroController.adicionar);

router.put("/polimero/atualizar/:id", polimeroController.atualizar);


module.exports = router;