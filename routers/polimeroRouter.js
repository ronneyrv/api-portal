const { Router } = require("express");
const polimeroController = require("../controllers/polimeroController");
const router = Router();

router.get("/polimero", polimeroController.condicao);
router.get("/polimero/volume", polimeroController.volume);


module.exports = router;