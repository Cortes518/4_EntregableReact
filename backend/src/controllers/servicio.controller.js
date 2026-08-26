import {
  obtenerTodosServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  cambiarEstadoServicio,
  eliminarServicio,
} from '../models/servicio.model.js';

export const listarServicios = async (req, res) => {
  try {
    const soloActivos = req.query.all !== 'true';
    const servicios = await obtenerTodosServicios(soloActivos);
    return res.status(200).json({
      success: true,
      total: servicios.length,
      servicios,
    });
  } catch (error) {
    console.error('Error al listar servicios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al listar servicios.',
    });
  }
};

export const obtenerServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await obtenerServicioPorId(id);

    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      servicio,
    });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

export const nuevoServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio, estado } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el precio del servicio son obligatorios.',
      });
    }

    const id = await crearServicio({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      precio: parseFloat(precio),
      estado: estado || 'Activo',
    });

    return res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente.',
      servicioId: id,
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al crear servicio.',
    });
  }
};

export const editarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, estado } = req.body;

    const servicio = await obtenerServicioPorId(id);
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.',
      });
    }

    const actualizado = await actualizarServicio(id, {
      nombre: nombre || servicio.nombre,
      descripcion: descripcion !== undefined ? descripcion : servicio.descripcion,
      precio: precio !== undefined ? parseFloat(precio) : servicio.precio,
      estado: estado || servicio.estado,
    });

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        message: 'No se realizaron cambios en el servicio.',
      });
    }

    const servicioActualizado = await obtenerServicioPorId(id);

    return res.status(200).json({
      success: true,
      message: 'Servicio actualizado correctamente.',
      servicio: servicioActualizado,
    });
  } catch (error) {
    console.error('Error al editar servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al editar servicio.',
    });
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const servicio = await obtenerServicioPorId(id);
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.',
      });
    }

    const nuevoEstado = estado || (servicio.estado === 'Activo' ? 'Inactivo' : 'Activo');
    await cambiarEstadoServicio(id, nuevoEstado);

    return res.status(200).json({
      success: true,
      message: `Estado del servicio cambiado a ${nuevoEstado}.`,
      nuevoEstado,
    });
  } catch (error) {
    console.error('Error al cambiar estado de servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

export const borrarServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const servicio = await obtenerServicioPorId(id);
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado.',
      });
    }

    await eliminarServicio(id);

    return res.status(200).json({
      success: true,
      message: 'Servicio eliminado correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar servicio.',
    });
  }
};
