import express from 'express';
import {
  listarProductos,
  obtenerProducto,
  nuevoProducto,
  editarProducto,
  cambiarEstado,
  borrarProducto,
} from '../controllers/producto.controller.js';
import { verificarToken, permitirRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas (para catálogo en la tienda)
router.get('/', listarProductos);
router.get('/:id', obtenerProducto);

// Rutas protegidas para administración de inventario
router.post('/', verificarToken, permitirRoles('Administrador', 'Empleado', 1, 2), nuevoProducto);
router.put('/:id', verificarToken, permitirRoles('Administrador', 'Empleado', 1, 2), editarProducto);
router.patch('/:id/status', verificarToken, permitirRoles('Administrador', 'Empleado', 1, 2), cambiarEstado);
router.delete('/:id', verificarToken, permitirRoles('Administrador', 1), borrarProducto);

export default router;
