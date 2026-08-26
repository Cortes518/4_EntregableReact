import pool from '../config/config.js';

export const obtenerTodosServicios = async (soloActivos = false) => {
  let query = 'SELECT * FROM servicios';
  if (soloActivos) {
    query += " WHERE estado = 'Activo'";
  }
  query += ' ORDER BY id DESC';
  const [rows] = await pool.execute(query);
  return rows;
};

export const obtenerServicioPorId = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM servicios WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

export const crearServicio = async (servicio) => {
  const { nombre, descripcion, precio, estado = 'Activo' } = servicio;
  const [result] = await pool.execute(
    `INSERT INTO servicios (nombre, descripcion, precio, estado) 
     VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, estado]
  );
  return result.insertId;
};

export const actualizarServicio = async (id, datos) => {
  const { nombre, descripcion, precio, estado } = datos;
  const [result] = await pool.execute(
    `UPDATE servicios 
     SET nombre = ?, descripcion = ?, precio = ?, estado = ?
     WHERE id = ?`,
    [nombre, descripcion, precio, estado, id]
  );
  return result.affectedRows > 0;
};

export const cambiarEstadoServicio = async (id, nuevoEstado) => {
  const [result] = await pool.execute(
    'UPDATE servicios SET estado = ? WHERE id = ?',
    [nuevoEstado, id]
  );
  return result.affectedRows > 0;
};

export const eliminarServicio = async (id) => {
  const [result] = await pool.execute(
    'DELETE FROM servicios WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
