import express from 'express';
import {
  listarServicios,
  obtenerServicio,
  nuevoServicio,
  editarServicio,
  cambiarEstado,
  borrarServicio,
} from '../controllers/servicio.controller.js';
import { verificarToken, permitirRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas (consulta de servicios)
router.get('/', listarServicios);
router.get('/:id', obtenerServicio);

// Rutas protegidas para administración de servicios
router.post('/', verificarToken, permitirRoles('Administrador', 'Empleado', 1, 2), nuevoServicio);
router.put('/:id', verificarToken, permitirRoles('Administrador', 'Empleado', 1, 2), editarServicio);
router.patch('/:id/status', verificarToken, permitirRoles('Administrador', 'Empleado', 1, 2), cambiarEstado);
router.delete('/:id', verificarToken, permitirRoles('Administrador', 1), borrarServicio);

export default router;
