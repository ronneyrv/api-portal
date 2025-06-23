const { Router } = require("express");
const rotController = require("../controllers/rotController");
const router = Router();

router.post("/rot", rotController.armazenar);
router.post("/arquivo/rot", rotController.buscar);

module.exports = router;
