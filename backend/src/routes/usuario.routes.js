import express from 'express';
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuarioAdmin,
  actualizarUsuario,
  cambiarEstado,
  eliminarUsuario,
} from '../controllers/usuario.controller.js';
import { verificarToken, permitirRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas de usuarios requieren autenticación
router.use(verificarToken);

// Rutas de administración de usuarios (Solo Administrador)
router.get('/', permitirRoles('Administrador', 1), listarUsuarios);
router.post('/', permitirRoles('Administrador', 1), crearUsuarioAdmin);
router.patch('/:id/status', permitirRoles('Administrador', 1), cambiarEstado);
router.delete('/:id', permitirRoles('Administrador', 1), eliminarUsuario);

// Consulta y actualización (Admin o propio usuario autenticado)
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);

export default router;
