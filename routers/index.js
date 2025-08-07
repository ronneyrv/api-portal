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

  app.use("/api", routerUsers);
  app.use("/api", routerEquipe);
  app.use("/api", routerLogin);
  app.use("/api", routerRot);
  app.use("/api", routerPDF);
  app.use("/api", routerCanhoes);
  app.use("/api", routerPolimero);
  app.use("/api", routerObservacao);
  app.use("/api", routerEstoque);
  app.use("/api", routerProgRetoma);
  app.use("/api", routerRetoma);
  app.use("/api", routerNavio);
};
