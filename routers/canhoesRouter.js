const { Router } = require("express");
const canhoesController = require("../controllers/canhoesController");
const router = Router();

router.get("/canhoes", canhoesController.listar);
router.put("/canhao", canhoesController.atualizar);
router.get("/canhao/sistema", canhoesController.modo);
router.put("/canhao/sistema", canhoesController.atualizarModo);


module.exports = router;