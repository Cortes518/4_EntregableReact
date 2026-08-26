import bcrypt from 'bcrypt';
import {
  obtenerTodosUsuarios,
  buscarUsuarioPorId,
  buscarUsuarioPorEmail,
  buscarUsuarioPorDocumento,
  crearUsuario,
  actualizarUsuario as actualizarUsuarioModel,
  cambiarEstadoUsuario,
  eliminarUsuario as eliminarUsuarioModel,
} from '../models/usuario.model.js';

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await obtenerTodosUsuarios();
    return res.status(200).json({
      success: true,
      total: usuarios.length,
      usuarios,
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al listar usuarios.',
    });
  }
};

export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await buscarUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

export const crearUsuarioAdmin = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      direccion,
      telefono,
      email,
      password,
      id_rol = 3,
      estado = 'Activo',
    } = req.body;

    if (!nombres || !apellidos || !tipo_documento || !numero_documento || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser diligenciados.',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const existeEmail = await buscarUsuarioPorEmail(emailNormalizado);
    if (existeEmail) {
      return res.status(409).json({
        success: false,
        message: 'El correo electrónico ya está registrado.',
      });
    }

    const existeDoc = await buscarUsuarioPorDocumento(numero_documento);
    if (existeDoc) {
      return res.status(409).json({
        success: false,
        message: 'El documento ya está registrado.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const id = await crearUsuario({
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      direccion: direccion || 'Sin dirección',
      telefono: telefono || '0000000000',
      email: emailNormalizado,
      password: passwordHash,
      id_rol: parseInt(id_rol),
      estado,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente por el administrador.',
      usuarioId: id,
    });
  } catch (error) {
    console.error('Error al crear usuario por admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear usuario.',
    });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, id_rol, estado } = req.body;

    const usuarioExistente = await buscarUsuarioPorId(id);
    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    // Si no es admin, solo puede actualizar sus propios datos personales
    if (req.usuario.id_rol !== 1 && req.usuario.id_usuario !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este usuario.',
      });
    }

    await actualizarUsuarioModel(id, {
      nombres: nombres !== undefined ? nombres : usuarioExistente.nombres,
      apellidos: apellidos !== undefined ? apellidos : usuarioExistente.apellidos,
      tipo_documento: tipo_documento !== undefined ? tipo_documento : usuarioExistente.tipo_documento,
      numero_documento: numero_documento !== undefined ? numero_documento : usuarioExistente.numero_documento,
      direccion: direccion !== undefined ? direccion : usuarioExistente.direccion,
      telefono: telefono !== undefined ? telefono : usuarioExistente.telefono,
      email: email ? email.trim().toLowerCase() : usuarioExistente.email,
      id_rol: req.usuario.id_rol === 1 ? (id_rol !== undefined ? parseInt(id_rol) : usuarioExistente.id_rol) : usuarioExistente.id_rol,
      estado: req.usuario.id_rol === 1 ? (estado !== undefined ? estado : usuarioExistente.estado) : usuarioExistente.estado,
    });

    const usuarioActualizado = await buscarUsuarioPorId(id);

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente.',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar usuario.',
    });
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const usuario = await buscarUsuarioPorId(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    // No permitir que el admin se desactive a sí mismo
    if (req.usuario.id_usuario === parseInt(id) && estado === 'Inactivo') {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta de administrador.',
      });
    }

    const nuevoEstado = estado || (usuario.estado === 'Activo' ? 'Inactivo' : 'Activo');

    await cambiarEstadoUsuario(id, nuevoEstado);

    return res.status(200).json({
      success: true,
      message: `Estado del usuario modificado a ${nuevoEstado}.`,
      nuevoEstado,
    });
  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id_usuario === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta.',
      });
    }

    const usuario = await buscarUsuarioPorId(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    await eliminarUsuarioModel(id);

    return res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};
