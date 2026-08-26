import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import servicioRoutes from "./routes/servicio.routes.js";

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta base de estado
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API PCortes (SENA Avance 3) funcionando correctamente",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      productos: "/api/v1/productos",
      servicios: "/api/v1/servicios"
    }
  });
});

// Rutas de la API (versión 1 y alias directo)
app.use("/api/v1/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/v1/users", usuarioRoutes);
app.use("/api/users", usuarioRoutes);

app.use("/api/v1/productos", productoRoutes);
app.use("/api/productos", productoRoutes);

app.use("/api/v1/servicios", servicioRoutes);
app.use("/api/servicios", servicioRoutes);

// Manejo de ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({
    success: false,
    message: "Error interno inesperado en el servidor.",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;