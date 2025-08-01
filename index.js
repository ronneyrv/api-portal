const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const router = require("./routers");
const helmet = require('helmet');
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // 'secure: false' é o padrão para HTTP
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  })
);

router(app, express);
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://portalpptm.energiapecem.local:${port}`);
});