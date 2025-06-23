const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const router = require("./routers");

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
      secure: false, // true apenas com HTTPS
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  })
);

router(app, express);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
