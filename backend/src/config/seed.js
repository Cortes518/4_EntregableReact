import pool from './config.js';

export async function runDatabaseSeed() {
  try {
    await pool.query(`
      INSERT INTO roles (id, nombre) VALUES
      (1, 'Administrador'),
      (2, 'Empleado'),
      (3, 'Cliente')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
    `);

    await pool.query(`
      INSERT INTO permisos (id, nombre, descripcion) VALUES
      (1, 'gestionar_usuarios', 'Permiso para crear, editar, listar y eliminar usuarios'),
      (2, 'gestionar_productos', 'Permiso para crear, editar, listar y eliminar productos'),
      (3, 'gestionar_servicios', 'Permiso para crear, editar, listar y eliminar servicios'),
      (4, 'ver_reportes', 'Permiso para ver reportes y estadísticas')
      ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)
    `);

    await pool.query(`
      INSERT INTO usuarios (id_usuario, id_rol, nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, password, estado) VALUES
      (1, 1, 'Admin', 'PCortes', 'CC', '1000000001', 'Oficina Central PCortes Calle 100', '3000000000', 'admin@pcortes.com', '$2b$10$hEaiyeixK2cV49YkuYCNbO1uwbGbt.IPyS43JnG1G9ysKERAdZM52', 'Activo'),
      (2, 2, 'Carlos', 'Gómez', 'CC', '1000000002', 'Sede Norte Cra 15 # 45-20', '3101234567', 'empleado@pcortes.com', '$2b$10$hEaiyeixK2cV49YkuYCNbO1uwbGbt.IPyS43JnG1G9ysKERAdZM52', 'Activo')
      ON DUPLICATE KEY UPDATE email = VALUES(email)
    `);

    await pool.query(`
      INSERT INTO productos (id, nombre, descripcion, precio, stock, estado) VALUES
      (1, 'PC Gamer Ultra Ryzen 9', 'Procesador AMD Ryzen 9 7900X, 32GB RAM DDR5, SSD 1TB NVMe, Tarjeta Gráfica RTX 4080 16GB.', 8500000.00, 10, 'Activo'),
      (2, 'PC Workstation Intel Core i9', 'Intel Core i9 14900K, 64GB RAM DDR5, 2TB SSD NVMe Gen4, Gráfica RTX 4090 24GB para render y 3D.', 12500000.00, 5, 'Activo'),
      (3, 'Setup Streaming Pro', 'Ryzen 7 7800X3D, 32GB RAM, SSD 1TB, RTX 4070 Ti, Capturadora 4K y Refrigeración Líquida RGB.', 6800000.00, 8, 'Activo'),
      (4, 'PC Gamer RGB Elite', 'Intel Core i7 13700F, 16GB RAM DDR4, SSD 512GB + HDD 1TB, RTX 4060 8GB.', 4200000.00, 15, 'Activo'),
      (5, 'PC Compact Mini ITX', 'AMD Ryzen 5 7600, 16GB RAM DDR5, SSD 1TB NVMe, RTX 4060 Ti tamaño compacto.', 3900000.00, 7, 'Activo')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
    `);

    await pool.query(`
      INSERT INTO servicios (id, nombre, descripcion, precio, estado) VALUES
      (1, 'Mantenimiento Preventivo y Limpieza', 'Limpieza profunda de componentes, cambio de pasta térmica de alto rendimiento y optimización del sistema.', 120000.00, 'Activo'),
      (2, 'Ensamble y Configuración Personalizada', 'Armado profesional de PC con gestión de cables oculta, actualización de BIOS y pruebas de estrés térmico.', 180000.00, 'Activo'),
      (3, 'Instalación y Optimización de Software', 'Instalación de Sistema Operativo, drivers actualizados, antivirus y suite de productividad.', 90000.00, 'Activo'),
      (4, 'Diagnóstico y Reparación de Hardware', 'Revisión exhaustiva con instrumental de diagnóstico para detección de fallas electrónicas.', 80000.00, 'Activo')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
    `);

    console.log('Seeding ejecutado con éxito.');
  } catch (error) {
    console.error('Error al ejecutar seeding:', error);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runDatabaseSeed().then(() => process.exit(0));
}
