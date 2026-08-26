-- ==========================================================
-- SCRIPT SQL: Base de datos proyecto_react
-- Tercer Avance del Proyecto SENA - Instructor: Jhan Hader Muñoz
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `proyecto_react` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `proyecto_react`;

-- --------------------------------------------------------
-- 1. Estructura de tabla: roles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rol_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Estructura de tabla: permisos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `permisos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permiso_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Estructura de tabla: roles_permisos (Tabla intermedia)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles_permisos` (
  `rol_id` int(11) NOT NULL,
  `permiso_id` int(11) NOT NULL,
  PRIMARY KEY (`rol_id`,`permiso_id`),
  KEY `fk_rp_permiso` (`permiso_id`),
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Estructura de tabla: categorias (Relación con productos y servicios)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categoria_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Estructura de tabla: usuarios
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL DEFAULT 3,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `tipo_documento` varchar(30) NOT NULL,
  `numero_documento` varchar(50) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_numdoc` (`numero_documento`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Estructura de tabla: productos (Relacionada con categorias y usuarios)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria_id` int(11) DEFAULT 1,
  `id_usuario_registro` int(11) DEFAULT 1,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_prod_cat` (`categoria_id`),
  KEY `fk_prod_usr` (`id_usuario_registro`),
  CONSTRAINT `fk_prod_cat` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_prod_usr` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Estructura de tabla: servicios (Relacionada con categorias y usuarios)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria_id` int(11) DEFAULT 3,
  `id_usuario_registro` int(11) DEFAULT 1,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_serv_cat` (`categoria_id`),
  KEY `fk_serv_usr` (`id_usuario_registro`),
  CONSTRAINT `fk_serv_cat` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_serv_usr` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- INSERCIÓN DE DATOS INICIALES Y SEMILLA
-- ==========================================================

-- Categorías
INSERT INTO `categorias` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Computadores y Equipos', 'Equipos ensamblados de alto rendimiento para gaming, renderizado y estudio'),
(2, 'Periféricos y Accesorios', 'Teclados, mouses, monitores y componentes individuales'),
(3, 'Servicios Técnicos Especializados', 'Mantenimiento, reparación, ensamble y optimización de hardware y software')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Roles iniciales
INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Empleado'),
(3, 'Cliente')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Permisos iniciales
INSERT INTO `permisos` (`id`, `nombre`, `descripcion`) VALUES
(1, 'gestionar_usuarios', 'Permiso para crear, editar, listar y eliminar usuarios'),
(2, 'gestionar_productos', 'Permiso para crear, editar, listar y eliminar productos'),
(3, 'gestionar_servicios', 'Permiso para crear, editar, listar y eliminar servicios'),
(4, 'ver_reportes', 'Permiso para ver reportes y estadísticas')
ON DUPLICATE KEY UPDATE `descripcion` = VALUES(`descripcion`);

-- Asignación de permisos a roles
INSERT IGNORE INTO `roles_permisos` (`rol_id`, `permiso_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), -- Administrador
(2, 2), (2, 3);                 -- Empleado

-- Usuario Administrador por defecto (Contraseña: Admin12345*)
INSERT INTO `usuarios` (`id_usuario`, `id_rol`, `nombres`, `apellidos`, `tipo_documento`, `numero_documento`, `direccion`, `telefono`, `email`, `password`, `estado`) VALUES
(1, 1, 'Admin', 'PCortes', 'CC', '1000000001', 'Oficina Central PCortes Calle 100', '3000000000', 'admin@pcortes.com', '$2b$10$hEaiyeixK2cV49YkuYCNbO1uwbGbt.IPyS43JnG1G9ysKERAdZM52', 'Activo')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Usuario Empleado por defecto (Contraseña: Empleado12345*)
INSERT INTO `usuarios` (`id_usuario`, `id_rol`, `nombres`, `apellidos`, `tipo_documento`, `numero_documento`, `direccion`, `telefono`, `email`, `password`, `estado`) VALUES
(2, 2, 'Carlos', 'Gómez', 'CC', '1000000002', 'Sede Norte Cra 15 # 45-20', '3101234567', 'empleado@pcortes.com', '$2b$10$hEaiyeixK2cV49YkuYCNbO1uwbGbt.IPyS43JnG1G9ysKERAdZM52', 'Activo')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Productos iniciales
INSERT INTO `productos` (`id`, `categoria_id`, `id_usuario_registro`, `nombre`, `descripcion`, `precio`, `stock`, `estado`) VALUES
(1, 1, 1, 'PC Gamer Ultra Ryzen 9', 'Procesador AMD Ryzen 9 7900X, 32GB RAM DDR5, SSD 1TB NVMe, Tarjeta Gráfica RTX 4080 16GB.', 8500000.00, 10, 'Activo'),
(2, 1, 1, 'PC Workstation Intel Core i9', 'Intel Core i9 14900K, 64GB RAM DDR5, 2TB SSD NVMe Gen4, Gráfica RTX 4090 24GB para render y 3D.', 12500000.00, 5, 'Activo'),
(3, 1, 1, 'Setup Streaming Pro', 'Ryzen 7 7800X3D, 32GB RAM, SSD 1TB, RTX 4070 Ti, Capturadora 4K y Refrigeración Líquida RGB.', 6800000.00, 8, 'Activo'),
(4, 1, 1, 'PC Gamer RGB Elite', 'Intel Core i7 13700F, 16GB RAM DDR4, SSD 512GB + HDD 1TB, RTX 4060 8GB.', 4200000.00, 15, 'Activo'),
(5, 1, 1, 'PC Compact Mini ITX', 'AMD Ryzen 5 7600, 16GB RAM DDR5, SSD 1TB NVMe, RTX 4060 Ti tamaño compacto.', 3900000.00, 7, 'Activo')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Servicios iniciales
INSERT INTO `servicios` (`id`, `categoria_id`, `id_usuario_registro`, `nombre`, `descripcion`, `precio`, `estado`) VALUES
(1, 3, 1, 'Mantenimiento Preventivo y Limpieza', 'Limpieza profunda de componentes, cambio de pasta térmica de alto rendimiento y optimización del sistema.', 120000.00, 'Activo'),
(2, 3, 1, 'Ensamble y Configuración Personalizada', 'Armado profesional de PC con gestión de cables oculta, actualización de BIOS y pruebas de estrés térmico.', 180000.00, 'Activo'),
(3, 3, 1, 'Instalación y Optimización de Software', 'Instalación de Sistema Operativo, drivers actualizados, antivirus y suite de productividad.', 90000.00, 'Activo'),
(4, 3, 1, 'Diagnóstico y Reparación de Hardware', 'Revisión exhaustiva con instrumental de diagnóstico para detección de fallas electrónicas.', 80000.00, 'Activo')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);
