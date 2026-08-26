import pool from './config.js';

export async function runDatabaseSeed() {
  try {
    // 1. Crear tabla categorias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id int(11) NOT NULL AUTO_INCREMENT,
        nombre varchar(100) NOT NULL,
        descripcion text DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_cat_nom (nombre)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Insertar categorias
    await pool.query(`
      INSERT INTO categorias (id, nombre, descripcion) VALUES
      (1, 'Computadores y Equipos', 'Equipos ensamblados de alto rendimiento para gaming, renderizado y estudio'),
      (2, 'Periféricos y Accesorios', 'Teclados, mouses, monitores y componentes individuales'),
      (3, 'Servicios Técnicos Especializados', 'Mantenimiento, reparación, ensamble y optimización de hardware y software')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
    `);

    // 3. Añadir columnas y FK a productos si no existen
    try {
      await pool.query(`ALTER TABLE productos ADD COLUMN categoria_id int(11) DEFAULT 1 AFTER id`);
    } catch (e) { /* Columna ya existe */ }
    try {
      await pool.query(`ALTER TABLE productos ADD COLUMN id_usuario_registro int(11) DEFAULT 1 AFTER categoria_id`);
    } catch (e) { /* Columna ya existe */ }

    // 4. Añadir columnas y FK a servicios si no existen
    try {
      await pool.query(`ALTER TABLE servicios ADD COLUMN categoria_id int(11) DEFAULT 3 AFTER id`);
    } catch (e) { /* Columna ya existe */ }
    try {
      await pool.query(`ALTER TABLE servicios ADD COLUMN id_usuario_registro int(11) DEFAULT 1 AFTER categoria_id`);
    } catch (e) { /* Columna ya existe */ }

    // 5. Insertar roles, permisos y usuarios
    await pool.query(`
      INSERT INTO roles (id, nombre) VALUES
      (1, 'Administrador'), (2, 'Empleado'), (3, 'Cliente')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
    `);

    await pool.query(`
      INSERT INTO usuarios (id_usuario, id_rol, nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, password, estado) VALUES
      (1, 1, 'Admin', 'PCortes', 'CC', '1000000001', 'Oficina Central PCortes Calle 100', '3000000000', 'admin@pcortes.com', '$2b$10$hEaiyeixK2cV49YkuYCNbO1uwbGbt.IPyS43JnG1G9ysKERAdZM52', 'Activo'),
      (2, 2, 'Carlos', 'Gómez', 'CC', '1000000002', 'Sede Norte Cra 15 # 45-20', '3101234567', 'empleado@pcortes.com', '$2b$10$hEaiyeixK2cV49YkuYCNbO1uwbGbt.IPyS43JnG1G9ysKERAdZM52', 'Activo')
      ON DUPLICATE KEY UPDATE email = VALUES(email)
    `);

    // 6. Insertar productos y servicios
    await pool.query(`
      INSERT INTO productos (id, categoria_id, id_usuario_registro, nombre, descripcion, precio, stock, estado) VALUES
      (1, 1, 1, 'PC Gamer Ultra Ryzen 9', 'Procesador AMD Ryzen 9 7900X, 32GB RAM DDR5, SSD 1TB NVMe, Tarjeta Gráfica RTX 4080 16GB.', 8500000.00, 10, 'Activo'),
      (2, 1, 1, 'PC Workstation Intel Core i9', 'Intel Core i9 14900K, 64GB RAM DDR5, 2TB SSD NVMe Gen4, Gráfica RTX 4090 24GB para render y 3D.', 12500000.00, 5, 'Activo'),
      (3, 1, 1, 'Setup Streaming Pro', 'Ryzen 7 7800X3D, 32GB RAM, SSD 1TB, RTX 4070 Ti, Capturadora 4K y Refrigeración Líquida RGB.', 6800000.00, 8, 'Activo'),
      (4, 1, 1, 'PC Gamer RGB Elite', 'Intel Core i7 13700F, 16GB RAM DDR4, SSD 512GB + HDD 1TB, RTX 4060 8GB.', 4200000.00, 15, 'Activo'),
      (5, 1, 1, 'PC Compact Mini ITX', 'AMD Ryzen 5 7600, 16GB RAM DDR5, SSD 1TB NVMe, RTX 4060 Ti tamaño compacto.', 3900000.00, 7, 'Activo')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
    `);

    await pool.query(`
      INSERT INTO servicios (id, categoria_id, id_usuario_registro, nombre, descripcion, precio, estado) VALUES
      (1, 3, 1, 'Mantenimiento Preventivo y Limpieza', 'Limpieza profunda de componentes, cambio de pasta térmica de alto rendimiento y optimización del sistema.', 120000.00, 'Activo'),
      (2, 3, 1, 'Ensamble y Configuración Personalizada', 'Armado profesional de PC con gestión de cables oculta, actualización de BIOS y pruebas de estrés térmico.', 180000.00, 'Activo'),
      (3, 3, 1, 'Instalación y Optimización de Software', 'Instalación de Sistema Operativo, drivers actualizados, antivirus y suite de productividad.', 90000.00, 'Activo'),
      (4, 3, 1, 'Diagnóstico y Reparación de Hardware', 'Revisión exhaustiva con instrumental de diagnóstico para detección de fallas electrónicas.', 80000.00, 'Activo')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
    `);

    console.log('Base de datos relacional actualizada con éxito.');
  } catch (error) {
    console.error('Error al actualizar BD relacional:', error);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runDatabaseSeed().then(() => process.exit(0));
}
