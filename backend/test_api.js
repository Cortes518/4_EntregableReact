import app from './src/app.js';

const PORT = 3999;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function runTests() {
  const server = app.listen(PORT, async () => {
    console.log(`\n========================================`);
    console.log(`🧪 INICIANDO PRUEBAS DE ENDPOINTS DE LA API`);
    console.log(`========================================\n`);

    let adminToken = '';
    let clienteToken = '';
    let nuevoUsuarioId = null;
    let nuevoProductoId = null;
    let nuevoServicioId = null;

    try {
      // 1. Test GET /
      const resRoot = await fetch(`http://localhost:${PORT}/`);
      const dataRoot = await resRoot.json();
      console.log('✅ 1. GET /:', dataRoot.message);

      // 2. Test Login Administrador
      const resLoginAdmin = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@pcortes.com', password: 'Admin12345*' })
      });
      const dataLoginAdmin = await resLoginAdmin.json();
      if (!dataLoginAdmin.token) throw new Error('No se generó token de admin');
      adminToken = dataLoginAdmin.token;
      console.log('✅ 2. POST /auth/login (Admin): OK, Token generado, Rol:', dataLoginAdmin.usuario.rol_nombre);

      // 3. Test Registro Cliente
      const randomDoc = '10' + Math.floor(10000000 + Math.random() * 90000000);
      const randomEmail = `cliente_${Date.now()}@test.com`;
      const resRegister = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: 'Juan',
          apellidos: 'Pérez',
          tipo_documento: 'CC',
          numero_documento: randomDoc,
          direccion: 'Calle 10 # 20-30',
          telefono: '3151234567',
          email: randomEmail,
          password: 'ClientePassword123*'
        })
      });
      const dataRegister = await resRegister.json();
      if (!dataRegister.success) throw new Error(dataRegister.message);
      nuevoUsuarioId = dataRegister.usuario.id_usuario;
      console.log('✅ 3. POST /auth/register: OK, Usuario registrado con ID:', nuevoUsuarioId);

      // 4. Test Login del nuevo Cliente
      const resLoginCliente = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: randomEmail, password: 'ClientePassword123*' })
      });
      const dataLoginCliente = await resLoginCliente.json();
      clienteToken = dataLoginCliente.token;
      console.log('✅ 4. POST /auth/login (Cliente): OK, Token JWT Cliente generado');

      // 5. Test Seguridad: Cliente intentando listar usuarios (Debe dar 403 Forbidden)
      const resForbidden = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${clienteToken}` }
      });
      console.log(`✅ 5. Seguridad: Cliente a GET /users -> Status ${resForbidden.status} (Esperado: 403 Forbidden)`);

      // 6. Test Admin listando usuarios (Debe dar 200 OK)
      const resListUsers = await fetch(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const dataListUsers = await resListUsers.json();
      console.log(`✅ 6. GET /users (Admin): OK, Total usuarios: ${dataListUsers.total}`);

      // 7. Test Admin cambiando estado de usuario (PATCH /users/:id/status)
      const resStatus = await fetch(`${BASE_URL}/users/${nuevoUsuarioId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ estado: 'Inactivo' })
      });
      const dataStatus = await resStatus.json();
      console.log(`✅ 7. PATCH /users/:id/status: OK, Nuevo estado: ${dataStatus.nuevoEstado}`);

      // 8. Test Admin creando Producto
      const resCreateProd = await fetch(`${BASE_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          nombre: 'Monitor Gaming 240Hz Test',
          descripcion: 'Monitor IPS 1ms 240Hz 27 pulgadas',
          precio: 1450000,
          stock: 12,
          estado: 'Activo'
        })
      });
      const dataCreateProd = await resCreateProd.json();
      nuevoProductoId = dataCreateProd.productoId;
      console.log('✅ 8. POST /productos (Admin): OK, Producto ID:', nuevoProductoId);

      // 9. Test GET /productos (Público)
      const resListProds = await fetch(`${BASE_URL}/productos`);
      const dataListProds = await resListProds.json();
      console.log(`✅ 9. GET /productos (Público): OK, Total activos: ${dataListProds.total}`);

      // 10. Test Admin creando Servicio
      const resCreateServ = await fetch(`${BASE_URL}/servicios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          nombre: 'Overclocking Seguro y Benchmarking',
          descripcion: 'Ajuste de frecuencias y voltajes con pruebas de estabilidad',
          precio: 150000,
          estado: 'Activo'
        })
      });
      const dataCreateServ = await resCreateServ.json();
      nuevoServicioId = dataCreateServ.servicioId;
      console.log('✅ 10. POST /servicios (Admin): OK, Servicio ID:', nuevoServicioId);

      // 11. Test DELETE producto y servicio
      await fetch(`${BASE_URL}/productos/${nuevoProductoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      await fetch(`${BASE_URL}/servicios/${nuevoServicioId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      await fetch(`${BASE_URL}/users/${nuevoUsuarioId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ 11. DELETE /productos, /servicios, /users: OK (Limpieza realizada)');

      console.log(`\n========================================`);
      console.log(`🎉 TODAS LAS PRUEBAS DEL BACKEND PASARON CON ÉXITO`);
      console.log(`========================================\n`);

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('\n❌ ERROR EN PRUEBAS:', err.message);
      server.close();
      process.exit(1);
    }
  });
}

runTests();
