const { Router } = require("express");
const retomaController = require("../controllers/retomaController");
const router = Router();

router.get("/retoma/listar", retomaController.listar);
router.get("/config/meta", retomaController.listarMetaTaxa);
router.get("/retoma/taxa/:ano", retomaController.listarTaxa);

router.post("/retoma/listar", retomaController.listarTurno);
router.post("/retoma/adicionar", retomaController.adicionar);

router.put("/config/meta", retomaController.atualizarMetaTaxa);
router.put("/retoma/atualizar/:id", retomaController.atualizar);

router.delete("/retoma/deletar/:id", retomaController.deletar);


module.exports = router;
