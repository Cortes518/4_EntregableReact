import {
  obtenerTodosProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  eliminarProducto,
} from '../models/producto.model.js';

export const listarProductos = async (req, res) => {
  try {
    // Si viene parametro all=true o si es admin/empleado, muestra todos, de lo contrario solo activos
    const soloActivos = req.query.all !== 'true';
    const productos = await obtenerTodosProductos(soloActivos);
    return res.status(200).json({
      success: true,
      total: productos.length,
      productos,
    });
  } catch (error) {
    console.error('Error al listar productos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al listar productos.',
    });
  }
};

export const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await obtenerProductoPorId(id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      producto,
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

export const nuevoProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, estado } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el precio del producto son obligatorios.',
      });
    }

    const id = await crearProducto({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      precio: parseFloat(precio),
      stock: parseInt(stock) || 0,
      estado: estado || 'Activo',
    });

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente.',
      productoId: id,
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al crear producto.',
    });
  }
};

export const editarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, estado } = req.body;

    const producto = await obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.',
      });
    }

    const actualizado = await actualizarProducto(id, {
      nombre: nombre || producto.nombre,
      descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
      precio: precio !== undefined ? parseFloat(precio) : producto.precio,
      stock: stock !== undefined ? parseInt(stock) : producto.stock,
      estado: estado || producto.estado,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        message: 'No se realizaron cambios en el producto.',
      });
    }

    const productoActualizado = await obtenerProductoPorId(id);

    return res.status(200).json({
      success: true,
      message: 'Producto actualizado correctamente.',
      producto: productoActualizado,
    });
  } catch (error) {
    console.error('Error al editar producto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al editar producto.',
    });
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const producto = await obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.',
      });
    }

    const nuevoEstado = estado || (producto.estado === 'Activo' ? 'Inactivo' : 'Activo');
    await cambiarEstadoProducto(id, nuevoEstado);

    return res.status(200).json({
      success: true,
      message: `Estado del producto cambiado a ${nuevoEstado}.`,
      nuevoEstado,
    });
  } catch (error) {
    console.error('Error al cambiar estado de producto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

export const borrarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await obtenerProductoPorId(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.',
      });
    }

    await eliminarProducto(id);

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar producto.',
    });
  }
};
