import pool from '../config/config.js';

export const obtenerTodosProductos = async (soloActivos = false) => {
  let query = 'SELECT * FROM productos';
  if (soloActivos) {
    query += " WHERE estado = 'Activo'";
  }
  query += ' ORDER BY id DESC';
  const [rows] = await pool.execute(query);
  return rows;
};

export const obtenerProductoPorId = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM productos WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

export const crearProducto = async (producto) => {
  const { nombre, descripcion, precio, stock = 0, estado = 'Activo' } = producto;
  const [result] = await pool.execute(
    `INSERT INTO productos (nombre, descripcion, precio, stock, estado) 
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, descripcion, precio, stock, estado]
  );
  return result.insertId;
};

export const actualizarProducto = async (id, datos) => {
  const { nombre, descripcion, precio, stock, estado } = datos;
  const [result] = await pool.execute(
    `UPDATE productos 
     SET nombre = ?, descripcion = ?, precio = ?, stock = ?, estado = ?
     WHERE id = ?`,
    [nombre, descripcion, precio, stock, estado, id]
  );
  return result.affectedRows > 0;
};

export const cambiarEstadoProducto = async (id, nuevoEstado) => {
  const [result] = await pool.execute(
    'UPDATE productos SET estado = ? WHERE id = ?',
    [nuevoEstado, id]
  );
  return result.affectedRows > 0;
};

export const eliminarProducto = async (id) => {
  const [result] = await pool.execute(
    'DELETE FROM productos WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
