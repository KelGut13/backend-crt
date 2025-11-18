const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Crear carpeta para uploads si no existe
const uploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.userId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  }
});

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.query(
      'SELECT id, gamerId, nombres, primerApellido, segundoApellido, username, email, photoURL, fechaCreacion, ultimaActualizacion FROM users WHERE id = ?',
      [userId]
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
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// PUT /api/users/upload-photo - Subir foto de perfil
router.put('/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    console.log('📸 Recibiendo foto de perfil...');
    
    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const userId = req.user.userId;
    console.log(`👤 Usuario ID: ${userId}`);
    console.log(`📁 Archivo guardado: ${req.file.filename}`);
    
    // Construir la URL de la imagen (relativa al servidor)
    const photoURL = `/uploads/profiles/${req.file.filename}`;
    console.log(`🔗 URL de la foto: ${photoURL}`);

    // Obtener la foto anterior para eliminarla
    const [users] = await pool.query('SELECT photoURL FROM users WHERE id = ?', [userId]);
    const oldPhotoURL = users[0]?.photoURL;

    // Actualizar la base de datos con la nueva URL
    await pool.query(
      'UPDATE users SET photoURL = ? WHERE id = ?',
      [photoURL, userId]
    );
    console.log('✅ Base de datos actualizada');

    // Eliminar la foto anterior si existe
    if (oldPhotoURL) {
      const oldPhotoPath = path.join(__dirname, '..', oldPhotoURL);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
        console.log(`🗑️ Foto anterior eliminada: ${oldPhotoURL}`);
      }
    }

    // Obtener el usuario actualizado
    const [updatedUsers] = await pool.query(
      'SELECT id, gamerId, nombres, primerApellido, segundoApellido, username, email, photoURL, fechaCreacion, ultimaActualizacion FROM users WHERE id = ?',
      [userId]
    );

    console.log('✅ Foto subida exitosamente');
    res.json({
      success: true,
      message: 'Foto de perfil actualizada exitosamente',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('❌ Error subiendo foto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la foto'
    });
  }
});

// PUT /api/users/profile - Actualizar datos del perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombres, primerApellido, segundoApellido } = req.body;

    const updates = [];
    const values = [];

    if (nombres) {
      updates.push('nombres = ?');
      values.push(nombres);
    }
    if (primerApellido) {
      updates.push('primerApellido = ?');
      values.push(primerApellido);
    }
    if (segundoApellido !== undefined) {
      updates.push('segundoApellido = ?');
      values.push(segundoApellido);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
    }

    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedUsers] = await pool.query(
      'SELECT id, gamerId, nombres, primerApellido, segundoApellido, username, email, photoURL, fechaCreacion, ultimaActualizacion FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
});

// PUT /api/users/online-status - Actualizar estado en línea
router.put('/online-status', authenticateToken, async (req, res) => {
  try {
    const { isOnline } = req.body;
    const userId = req.user.userId;

    await pool.query(
      'UPDATE users SET isOnline = ?, lastSeen = NOW() WHERE id = ?',
      [isOnline, userId]
    );

    console.log(`📡 Usuario ${userId} ahora está ${isOnline ? 'en línea ✅' : 'desconectado ❌'}`);

    res.json({
      success: true,
      message: 'Estado actualizado'
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado'
    });
  }
});

// GET /api/users/debug/check-online - Verificar estructura de tabla (temporal)
router.get('/debug/check-online', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Obtener info del usuario
    const [users] = await pool.query(
      'SELECT id, username, isOnline, lastSeen FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/users/profile/:userId - Obtener perfil completo de un usuario con sus logros
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`👤 Obteniendo perfil del usuario ${userId}`);

    // Obtener información del usuario
    const [users] = await pool.query(
      'SELECT id, gamerId, nombres, primerApellido, segundoApellido, username, email, photoURL, isOnline, lastSeen, fechaCreacion FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    // Obtener logros del usuario
    const [achievements] = await pool.query(
      `SELECT l.id, l.titulo, l.descripcion, l.icono, ul.fecha 
       FROM usuario_logros ul
       INNER JOIN logros l ON ul.logroId = l.id
       WHERE ul.usuarioId = ?
       ORDER BY ul.fecha DESC`,
      [userId]
    );

    // Agregar logros al perfil del usuario
    user.achievements = achievements;

    console.log(`✅ Perfil de ${user.username} obtenido con ${achievements.length} logros`);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

// PUT /api/users/update - Actualizar perfil de usuario
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombres, primerApellido, segundoApellido, currentPassword, newPassword } = req.body;

    console.log(`📝 Actualizando perfil del usuario ${userId}`);

    // Validar campos requeridos
    if (!nombres || !primerApellido) {
      return res.status(400).json({
        success: false,
        message: 'Nombres y primer apellido son requeridos'
      });
    }

    // Si se está cambiando la contraseña, validar
    if (currentPassword && newPassword) {
      const bcrypt = require('bcrypt');
      
      // Obtener la contraseña actual del usuario
      const [users] = await pool.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar con nueva contraseña
      await pool.query(
        'UPDATE users SET nombres = ?, primerApellido = ?, segundoApellido = ?, password = ?, ultimaActualizacion = NOW() WHERE id = ?',
        [nombres, primerApellido, segundoApellido || null, hashedPassword, userId]
      );

      console.log(`✅ Perfil y contraseña actualizados para usuario ${userId}`);
    } else {
      // Actualizar solo información personal
      await pool.query(
        'UPDATE users SET nombres = ?, primerApellido = ?, segundoApellido = ?, ultimaActualizacion = NOW() WHERE id = ?',
        [nombres, primerApellido, segundoApellido || null, userId]
      );

      console.log(`✅ Perfil actualizado para usuario ${userId}`);
    }

    // Obtener datos actualizados
    const [updatedUsers] = await pool.query(
      'SELECT id, gamerId, nombres, primerApellido, segundoApellido, username, email, photoURL, fechaCreacion, ultimaActualizacion FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: updatedUsers[0],
      message: 'Perfil actualizado correctamente'
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
});

module.exports = router;
