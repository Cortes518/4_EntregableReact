import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar la validez del Token JWT en los headers
 */
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó un token de autenticación válido.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'PC_CORTES_SECRET_2026';
    const decoded = jwt.verify(token, secret);
    req.usuario = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token de autenticación ha expirado. Inicia sesión nuevamente.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Token de autenticación inválido o alterado.',
    });
  }
};

/**
 * Middleware para verificar si el usuario autenticado tiene uno de los roles permitidos
 * @param  {...string|number} rolesPermitidos Nombres de rol ('Administrador', 'Empleado', 'Cliente') o IDs (1, 2, 3)
 */
export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
      });
    }

    const { id_rol, rol_nombre } = req.usuario;

    const tienePermiso = rolesPermitidos.some((rol) => {
      if (typeof rol === 'number') return rol === id_rol;
      if (typeof rol === 'string') {
        return rol.toLowerCase() === (rol_nombre || '').toLowerCase();
      }
      return false;
    });

    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: `Acceso prohibido. Tu rol (${rol_nombre || id_rol}) no tiene privilegios para realizar esta acción.`,
      });
    }

    next();
  };
};
