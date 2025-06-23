const routerUsers = require("./usersRouter");
const routerEquipe = require("./equipeRouter");
const routerLogin = require("./loginRouter");
const routerRot = require("./rotRouter");
const routerPDF = require("./pdfRouter");
const routerCanhoes = require("./canhoesRouter");
const routerPolimero = require("./polimeroRouter");
const routerObservacao = require("./observacaoRouter");
const routerEstoque = require("./estoqueRouter");
const routerProgRetoma = require("./progRetomaRouter");
const routerRetoma = require("./retomaRouter");
const routerNavio = require("./descarregamentoRouter");

module.exports = (app, express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(routerUsers);
  app.use(routerEquipe);
  app.use(routerLogin);
  app.use(routerRot);
  app.use(routerPDF);
  app.use(routerCanhoes);
  app.use(routerPolimero);
  app.use(routerObservacao);
  app.use(routerEstoque);
  app.use(routerProgRetoma);
  app.use(routerRetoma);
  app.use(routerNavio);
};
