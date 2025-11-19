const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();

// Función para generar GameID único
function generateGameId() {
  return Math.floor(100000 + Math.random() * 900000);
}

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  const { username, email, password, nombres, primerApellido, segundoApellido } = req.body;

  try {
    // Validar campos requeridos
    if (!username || !email || !password || !nombres || !primerApellido) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Verificar si el username ya existe
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe'
      });
    }

    // Generar GameID único
    let gamerId;
    let isUnique = false;
    while (!isUnique) {
      gamerId = generateGameId();
      const [existing] = await pool.query('SELECT id FROM users WHERE gamerId = ?', [gamerId]);
      isUnique = existing.length === 0;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario con photoURL por defecto (nota: columna es 'passwordHash' no 'password')
    const [result] = await pool.query(
      `INSERT INTO users (gamerId, nombres, primerApellido, segundoApellido, username, email, passwordHash, photoURL) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [gamerId, nombres, primerApellido, segundoApellido || null, username, email, hashedPassword, 'default']
    );

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        username, 
        gamerId 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Obtener el usuario recién creado
    const [users] = await pool.query(
      'SELECT id, gamerId, nombres, primerApellido, segundoApellido, username, email, photoURL, fechaCreacion, ultimaActualizacion FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: users[0],
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  const loginIdentifier = username || email; // Acepta username o email

  try {
    // Validar campos
    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario/Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por username o email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [loginIdentifier, loginIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar contraseña (columna es 'passwordHash' no 'password')
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        gamerId: user.gamerId 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remover la contraseña del objeto user antes de enviarlo
    delete user.passwordHash;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

// GET /api/auth/me - Obtener usuario actual (ruta protegida)
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.query(
      'SELECT id, gamerId, nombres, primerApellido, segundoApellido, username, email, photoURL, fechaCreacion, ultimaActualizacion FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerido'
      });
    }

    // Verificar si el usuario existe
    const [users] = await pool.query(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email]
    );

    // Por seguridad, siempre responder con éxito aunque el email no exista
    // Esto previene que se pueda verificar qué emails están registrados
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });
    }

    // Generar un código de recuperación de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

    // Guardar el código en la base de datos (necesitarás crear esta tabla)
    // Por ahora solo simularemos el envío
    console.log(`Código de recuperación para ${email}: ${resetCode}`);
    console.log(`Expira: ${expiresAt}`);

    // En producción, aquí enviarías un email con el código
    // Por ahora retornamos el código en la respuesta (solo para desarrollo)
    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      // Solo en desarrollo - eliminar en producción
      dev: {
        resetCode,
        email: users[0].email
      }
    });

  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

module.exports = router;
