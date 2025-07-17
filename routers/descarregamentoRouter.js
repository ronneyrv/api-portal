const { Router } = require("express");
const navioController = require("../controllers/navioController");
const router = Router();

router.post("/descarregamento", navioController.adicionar);
router.get("/descarregamento", navioController.listar);
router.put("/descarregamento", navioController.previsaoFim);

router.get("/descarregamento/pilhas", navioController.pilhas);
router.get("/descarregamento/descarregando", navioController.buscar);
router.get("/descarregamento/:navio", navioController.listarNavio);
router.put("/descarregamento/:navio", navioController.atualizar);

module.exports = router;
