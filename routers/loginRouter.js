const { Router } = require("express");
const loginController = require("../controllers/loginController");
const router = Router();

router.post("/login", loginController.login);
router.post("/logout", loginController.logout);
router.post("/verificaLogin", loginController.verificar);
router.post("/renovar", loginController.renovar);

module.exports = router;
