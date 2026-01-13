const { Router } = require("express");
const ContratoController = require("../controllers/contratoController");
const router = Router();

router.get("/contratos", ContratoController.listar);
router.get("/contratos/orcamento/anual", ContratoController.orcamentoAnual);
router.get("/contratos/medicao/:ano", ContratoController.listarMedicoes);
router.get("/contratos/painel/:contrato", ContratoController.infoPainel);
router.get("/contratos/:ano/:contrato", ContratoController.previsaoContrato);
router.get("/contratos/orcamento/fornecedores/:status/:tipo", ContratoController.contrato);

router.post("/contratos", ContratoController.adicionar);
router.post("/contratos/medicao", ContratoController.adicionarMedicao);
router.post("/contratos/provisoes", ContratoController.adicionarProvisao);

router.put("/contratos", ContratoController.atualizar);
router.put("/contratos/medicao", ContratoController.atualizarMedicao);
router.put("/contratos/medicao/status", ContratoController.atualizarMedicaoStatus);
router.put("/contratos/orcamento/anual", ContratoController.atualizarOrcamentoAnual);
router.put("/contratos/encerramento", ContratoController.encerrar);
router.put("/contratos/reajuste", ContratoController.reajuste);

module.exports = router;
