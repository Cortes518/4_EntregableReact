import pool from "../config/config.js";

/**
 * Busca un usuario por su email incluyendo el nombre de su rol
 */
export const buscarUsuarioPorEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT u.*, r.nombre AS rol_nombre 
     FROM usuarios u 
     LEFT JOIN roles r ON u.id_rol = r.id 
     WHERE u.email = ? 
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

/**
 * Busca un usuario por su ID
 */
export const buscarUsuarioPorId = async (id) => {
  const [rows] = await pool.execute(
    `SELECT u.id_usuario, u.id_rol, r.nombre AS rol_nombre, u.nombres, u.apellidos, 
            u.tipo_documento, u.numero_documento, u.direccion, u.telefono, u.email, 
            u.foto, u.estado, u.ultimo_acceso, u.fecha_registro, u.fecha_actualizacion
     FROM usuarios u
     LEFT JOIN roles r ON u.id_rol = r.id
     WHERE u.id_usuario = ? 
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Busca si existe un usuario con un documento específico
 */
export const buscarUsuarioPorDocumento = async (numero_documento) => {
  const [rows] = await pool.execute(
    "SELECT id_usuario FROM usuarios WHERE numero_documento = ? LIMIT 1",
    [numero_documento]
  );
  return rows[0] || null;
};

/**
 * Inserta un nuevo usuario en la base de datos
 */
export const crearUsuario = async (usuario) => {
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
    estado = 'Activo'
  } = usuario;

  const [result] = await pool.execute(
    `INSERT INTO usuarios (
      nombres, apellidos, tipo_documento, numero_documento, direccion,
      telefono, email, password, id_rol, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      direccion,
      telefono,
      email,
      password,
      id_rol,
      estado
    ]
  );
  return result.insertId;
};

/**
 * Obtiene todos los usuarios registrados con su información de rol
 */
export const obtenerTodosUsuarios = async () => {
  const [rows] = await pool.execute(
    `SELECT u.id_usuario, u.id_rol, r.nombre AS rol_nombre, u.nombres, u.apellidos, 
            u.tipo_documento, u.numero_documento, u.direccion, u.telefono, u.email, 
            u.estado, u.ultimo_acceso, u.fecha_registro
     FROM usuarios u
     LEFT JOIN roles r ON u.id_rol = r.id
     ORDER BY u.id_usuario DESC`
  );
  return rows;
};

/**
 * Actualiza los datos de un usuario por su ID
 */
export const actualizarUsuario = async (id, datos) => {
  const { nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, id_rol, estado } = datos;
  
  const [result] = await pool.execute(
    `UPDATE usuarios 
     SET nombres = ?, apellidos = ?, tipo_documento = ?, numero_documento = ?, 
         direccion = ?, telefono = ?, email = ?, id_rol = COALESCE(?, id_rol), estado = COALESCE(?, estado)
     WHERE id_usuario = ?`,
    [nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, id_rol || null, estado || null, id]
  );
  return result.affectedRows >= 0;
};

/**
 * Cambia el estado de un usuario (Activo / Inactivo)
 */
export const cambiarEstadoUsuario = async (id, nuevoEstado) => {
  const [result] = await pool.execute(
    `UPDATE usuarios SET estado = ? WHERE id_usuario = ?`,
    [nuevoEstado, id]
  );
  return result.affectedRows > 0;
};

/**
 * Actualiza el último acceso del usuario
 */
export const actualizarUltimoAcceso = async (id) => {
  await pool.execute(
    `UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = ?`,
    [id]
  );
};

/**
 * Elimina físicamente un usuario por su ID
 */
export const eliminarUsuario = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM usuarios WHERE id_usuario = ?`,
    [id]
  );
  return result.affectedRows > 0;
};