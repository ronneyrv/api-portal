const loginModel = require("../models/login");

class LoginController {
  async login(req, res) {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res
        .status(400)
        .json({ type: "error", message: "Usuário e senha obrigatórios" });
    }

    try {
      const resultado = await loginModel.autenticar(usuario, senha);
      if (!resultado) {
        return res
          .status(401)
          .json({ type: "error", message: "Credenciais inválidas" });
      }

      req.session.usuario = {
        id: resultado.id,
        email: resultado.email,
        usuario: resultado.usuario,
        nivel: resultado.nivel,
      };

      res.status(200).json({
        type: "success",
        message: "Login realizado com sucesso",
      });
    } catch (err) {
      console.error("Erro no login:", err.message || err);
      res.status(500).json({ type: "error", message: err.message || "Erro no login" });
    }
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao encerrar sessão:", err);
        return res.status(500).json({ type: "error", message: "Erro ao sair" });
      }

      res.clearCookie("connect.sid");
      res.status(200).json({
        type: "success",
        message: "Logout efetuado com sucesso",
      });
    });
  }

  verificar(req, res) {
    const usuario = req.session?.usuario;
    if (usuario) {
      return res.status(200).json({
        loggedIn: true,
        usuario: usuario,
      });
    } else {
      return res.status(200).json({
        loggedIn: false,
      });
    }
  }

  renovar(req, res) {
    if (!req.session.usuario) {
      return res.status(401).json({
        type: "error",
        message: "Sessão expirada ou inexistente",
      });
    }
    req.session.touch(); // Atualiza o tempo de expiração
    res.status(200).json({
      type: "success",
      message: "Sessão renovada com sucesso",
    });
  }
}

module.exports = new LoginController();
