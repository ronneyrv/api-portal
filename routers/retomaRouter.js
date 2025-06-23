const { Router } = require("express");
const retomaController = require("../controllers/retomaController");
const router = Router();

router.post("/retoma", retomaController.listar);

module.exports = router;
