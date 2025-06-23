const { Router } = require("express");
const progRetomaController = require("../controllers/progRetomaController");
const router = Router();

router.get("/prog-retoma/:semana", progRetomaController.listar);
router.post("/prog-retoma", progRetomaController.add);

module.exports = router;
