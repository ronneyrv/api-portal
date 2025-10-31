const { Router } = require("express");
const navioController = require("../controllers/navioController");
const router = Router();

// Rotas GET sem parâmetros
router.get("/descarregamento", navioController.listar);
router.get("/descarregamento/consolidado", navioController.listaConsolidados);
router.get("/descarregamento/pilhas", navioController.pilhas);
router.get("/descarregamento/descarregando", navioController.buscarNavioAtracado);
router.get("/descarregamento/ocioso", navioController.buscarOciosidade);
router.get("/descarregamento/ocorrencias", navioController.buscarOcorrenciaGeral);
router.get("/descarregamento/lista/ocorrencia", navioController.buscarLista);
router.get("/descarregamento/ultima/ocorrencia", navioController.buscarUltima);
// Rotas GET com parâmetros
router.get("/descarregamento/consolidado/:navio", navioController.navioConsolidado);
router.get("/descarregamento/plano/descarga/:navio", navioController.buscarPlano);
router.get("/descarregamento/total/arqueado/:navio", navioController.buscarArqueacoes);
router.get("/descarregamento/pareto/operacao/:navio", navioController.paretoOperacao);
router.get("/descarregamento/pareto/manutencao/:navio", navioController.paretoManutencao);
router.get("/descarregamento/cascata/eventos/:navio", navioController.cascataEventos);
router.get("/descarregamento/corretiva/preventiva/:navio", navioController.corretivPreventiva);
router.get("/descarregamento/ocorrencia/atracado/:navio", navioController.ocorrenciasNavioAtracado);
router.get("/descarregamento/ocorrencia/top10/ope/:navio", navioController.buscarTopOpe);
router.get("/descarregamento/ocorrencia/top10/man/:navio", navioController.buscarTopMan);
// Rotas POST
router.post("/descarregamento", navioController.adicionar);
router.post("/descarregamento/adicionar/ocorrencia", navioController.adicionarOcorrencia);
router.post("/descarregamento/adicionar/plano/descarga", navioController.adicionarPlano);

// Rotas PUT
router.put("/descarregamento", navioController.previsaoFim);
router.put("/descarregamento/meta", navioController.atualizaMeta);
router.put("/descarregamento/arqueacao", navioController.atualizaArqueacao);
router.put("/descarregamento/finalizar", navioController.finalizar);
router.put("/descarregamento/atualizar/ocorrencia", navioController.atualizarOcorrencia);
router.put("/descarregamento/ocorrencia/simples/:id", navioController.atualizarOcorrenciaSimples);



module.exports = router;
