import pool from './src/config/config.js';
import bcrypt from 'bcrypt';

async function fixPasswords() {
  const hashAdmin    = await bcrypt.hash('Admin12345*', 10);
  const hashEmpleado = await bcrypt.hash('Empleado12345*', 10);

  await pool.execute('UPDATE usuarios SET password = ? WHERE email = ?', [hashAdmin, 'admin@pcortes.com']);
  console.log('✅ Hash Admin actualizado.');

  await pool.execute('UPDATE usuarios SET password = ? WHERE email = ?', [hashEmpleado, 'empleado@pcortes.com']);
  console.log('✅ Hash Empleado actualizado.');

  // Verificacion
  const { default: bCrypt } = await import('bcrypt');
  const [[admin]]    = await pool.execute('SELECT password FROM usuarios WHERE email = ?', ['admin@pcortes.com']);
  const [[empleado]] = await pool.execute('SELECT password FROM usuarios WHERE email = ?', ['empleado@pcortes.com']);

  const okAdmin    = await bcrypt.compare('Admin12345*',    admin.password);
  const okEmpleado = await bcrypt.compare('Empleado12345*', empleado.password);

  console.log('Verificacion Admin:    ', okAdmin    ? 'CORRECTA ✅' : 'FALLO ❌');
  console.log('Verificacion Empleado: ', okEmpleado ? 'CORRECTA ✅' : 'FALLO ❌');

  process.exit(0);
}

fixPasswords().catch((e) => { console.error(e); process.exit(1); });
