const { Router } = require("express");
const equipeController = require("../controllers/equipeController");
const router = Router();

router.post("/equipe", equipeController.criar);

router.get("/equipe", equipeController.listar);

router.put("/equipe/:id", equipeController.atualizar);
router.put("/equipe/delete/:id", equipeController.deletar);

module.exports = router;
