import express from "express";
import { register, login, perfil, recuperarPassword } from "../controllers/auth.controller.js";
import { verificarToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/perfil", verificarToken, perfil);
router.post("/forgot-password", recuperarPassword);
router.post("/recuperar-password", recuperarPassword);

export default router;