const { Router } = require("express");
const usersController = require("../controllers/usersController");
const router = Router();

router.get("/usuarios", usersController.buscar);
router.post("/usuarios", usersController.criar);
router.put("/usuario", usersController.atualizar);
router.delete("/usuario/:id", usersController.deletar);

module.exports = router;
