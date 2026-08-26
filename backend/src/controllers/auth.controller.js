import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  buscarUsuarioPorEmail,
  buscarUsuarioPorDocumento,
  buscarUsuarioPorId,
  crearUsuario,
  actualizarUltimoAcceso,
} from "../models/usuario.model.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telefonoRegex = /^[0-9]{7,10}$/;
const docRegex = /^[0-9]{5,12}$/;

/**
 * Registro de nuevos usuarios (Clientes por defecto)
 */
export const register = async (req, res) => {
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
    } = req.body;

    // Validar campos obligatorios
    if (
      !nombres?.trim() ||
      !apellidos?.trim() ||
      !tipo_documento?.trim() ||
      !numero_documento?.trim() ||
      !direccion?.trim() ||
      !telefono?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos obligatorios deben ser diligenciados.",
      });
    }

    // Validaciones estrictas de formato y longitud
    if (nombres.trim().length < 2 || nombres.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "El nombre debe tener entre 2 y 50 caracteres.",
      });
    }

    if (apellidos.trim().length < 2 || apellidos.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "El apellido debe tener entre 2 y 50 caracteres.",
      });
    }

    if (!docRegex.test(numero_documento.trim())) {
      return res.status(400).json({
        success: false,
        message: "El número de documento debe tener entre 5 y 12 dígitos numéricos.",
      });
    }

    if (!telefonoRegex.test(telefono.trim())) {
      return res.status(400).json({
        success: false,
        message: "El teléfono debe tener entre 7 y 10 dígitos numéricos.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    if (!emailRegex.test(emailNormalizado) || emailNormalizado.length > 80) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico no tiene un formato válido.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener mínimo 8 caracteres.",
      });
    }

    // Verificar si el correo ya está registrado
    const usuarioExiste = await buscarUsuarioPorEmail(emailNormalizado);
    if (usuarioExiste) {
      return res.status(409).json({
        success: false,
        message: "El correo electrónico ya se encuentra registrado.",
      });
    }

    // Verificar si el documento ya está registrado
    const docExiste = await buscarUsuarioPorDocumento(numero_documento.trim());
    if (docExiste) {
      return res.status(409).json({
        success: false,
        message: "El número de documento ya se encuentra registrado.",
      });
    }

    // Encriptar contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const rolCliente = 3; // Rol Cliente

    const usuarioId = await crearUsuario({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      tipo_documento: tipo_documento.trim(),
      numero_documento: numero_documento.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      email: emailNormalizado,
      password: passwordHash,
      id_rol: rolCliente,
      estado: "Activo",
    });

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente.",
      usuario: {
        id_usuario: usuarioId,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: emailNormalizado,
        id_rol: rolCliente,
        rol_nombre: "Cliente",
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar el registro.",
    });
  }
};

/**
 * Inicio de sesión y generación de JWT
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Debes ingresar tu correo y contraseña.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuario = await buscarUsuarioPorEmail(emailNormalizado);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas o usuario no registrado.",
      });
    }

    // Verificar si el usuario se encuentra Activo
    if (usuario.estado !== "Activo") {
      return res.status(403).json({
        success: false,
        message: "Tu cuenta se encuentra inactiva. Contacta al administrador.",
      });
    }

    // Verificar la contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas o usuario no registrado.",
      });
    }

    // Actualizar fecha de último acceso
    await actualizarUltimoAcceso(usuario.id_usuario);

    // Generar Token JWT
    const payload = {
      id_usuario: usuario.id_usuario,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      id_rol: usuario.id_rol,
      rol_nombre: usuario.rol_nombre || (usuario.id_rol === 1 ? 'Administrador' : usuario.id_rol === 2 ? 'Empleado' : 'Cliente'),
    };

    const secret = process.env.JWT_SECRET || "PC_CORTES_SECRET_2026";
    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    const token = jwt.sign(payload, secret, { expiresIn });

    return res.status(200).json({
      success: true,
      message: `¡Bienvenido de nuevo, ${usuario.nombres}!`,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        tipo_documento: usuario.tipo_documento,
        numero_documento: usuario.numero_documento,
        direccion: usuario.direccion,
        telefono: usuario.telefono,
        email: usuario.email,
        id_rol: usuario.id_rol,
        rol_nombre: payload.rol_nombre,
        estado: usuario.estado,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar el inicio de sesión.",
    });
  }
};

/**
 * Obtener perfil del usuario autenticado (requiere token)
 */
export const perfil = async (req, res) => {
  try {
    const usuario = await buscarUsuarioPorId(req.usuario.id_usuario);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }
    return res.status(200).json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
};

/**
 * Recuperación de contraseña (Simulación de proceso ficticio por correo)
 */
export const recuperarPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es obligatorio.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuario = await buscarUsuarioPorEmail(emailNormalizado);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "No se encontró ningún usuario registrado con este correo electrónico.",
      });
    }

    const codigoSeguridad = `PC-${Math.floor(100000 + Math.random() * 900000)}`;
    const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    console.log(`\n========================================`);
    console.log(`📨 [CORREO FICTICIO ENVIADO EXITOSAMENTE]`);
    console.log(`De: soporte@pcortes.com`);
    console.log(`Para: ${emailNormalizado} (${usuario.nombres} ${usuario.apellidos})`);
    console.log(`Asunto: Restablecimiento de Contraseña - PCortes`);
    console.log(`Código temporal: ${codigoSeguridad}`);
    console.log(`========================================\n`);

    return res.status(200).json({
      success: true,
      message: `Correo de recuperación enviado exitosamente a ${emailNormalizado}.`,
      correoFicticio: {
        remitente: "soporte@pcortes.com",
        destinatario: emailNormalizado,
        nombreUsuario: `${usuario.nombres} ${usuario.apellidos}`,
        asunto: "Instrucciones para Restablecer tu Contraseña - PCortes",
        codigoSeguridad,
        expiraEn: fechaExpiracion,
        enlaceFicticio: `https://pcortes.com/auth/reset?code=${codigoSeguridad}`,
        pasos: [
          "1. Abre el enlace de verificación recibido.",
          `2. Digita tu código de seguridad temporal: ${codigoSeguridad}`,
          "3. Define tu nueva contraseña segura (mínimo 8 caracteres).",
          "4. Confirma el cambio e inicia sesión inmediatamente."
        ]
      }
    });
  } catch (error) {
    console.error("Error en recuperarPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al procesar la recuperación de contraseña.",
    });
  }
};