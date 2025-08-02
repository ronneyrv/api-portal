const { Router } = require("express");
const navioController = require("../controllers/navioController");
const router = Router();

router.post("/descarregamento", navioController.adicionar);
router.get("/descarregamento", navioController.listar);
router.put("/descarregamento", navioController.previsaoFim);
router.get("/descarregamento/pilhas", navioController.pilhas);
router.get("/descarregamento/descarregando", navioController.buscarNavioAtracado);
router.get("/descarregamento/:navio", navioController.ocorrenciasNavioAtracado);
router.get("/descarregamento/ocorrencia/:id", navioController.buscarOcorrencia);
router.put("/descarregamento/ocorrencia/simples/:id", navioController.atualizarOcorrenciaSimples);
router.get("/descarregamento/pareto/operacao/:navio", navioController.paretoOperacao);
router.get("/descarregamento/pareto/manutencao/:navio", navioController.paretoManutencao);
router.get("/descarregamento/cascata/eventos/:navio", navioController.cascataEventos);
router.get("/descarregamento/corretiva/preventiva/:navio", navioController.corretivPreventiva);

module.exports = router;
