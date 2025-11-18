const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/achievements/all - Obtener todos los logros disponibles
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const [achievements] = await pool.query(
      'SELECT id, titulo, descripcion, icono FROM logros ORDER BY id ASC'
    );

    console.log(`🏆 Total de logros disponibles: ${achievements.length}`);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error obteniendo logros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logros'
    });
  }
});

// GET /api/achievements/available - Obtener logros disponibles (no conseguidos por el usuario)
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener logros que el usuario NO tiene
    const [achievements] = await pool.query(
      `SELECT l.id, l.titulo, l.descripcion, l.icono
       FROM logros l
       WHERE l.id NOT IN (
         SELECT logroId FROM usuario_logros WHERE usuarioId = ?
       )
       ORDER BY l.id ASC`,
      [userId]
    );

    console.log(`🎯 Logros disponibles para usuario ${userId}: ${achievements.length}`);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error obteniendo logros disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logros disponibles'
    });
  }
});

// GET /api/achievements/user - Obtener logros del usuario
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [achievements] = await pool.query(
      `SELECT l.id, l.titulo, l.descripcion, l.icono, ul.fecha
       FROM usuario_logros ul
       INNER JOIN logros l ON ul.logroId = l.id
       WHERE ul.usuarioId = ?
       ORDER BY ul.fecha DESC`,
      [userId]
    );

    console.log(`🏅 Logros del usuario ${userId}: ${achievements.length}`);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error obteniendo logros del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logros del usuario'
    });
  }
});

// POST /api/achievements/add - Agregar logro al usuario
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { achievementId } = req.body;

    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'ID de logro requerido'
      });
    }

    // Verificar que el logro existe
    const [achievement] = await pool.query(
      'SELECT id, titulo FROM logros WHERE id = ?',
      [achievementId]
    );

    if (achievement.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Logro no encontrado'
      });
    }

    // Verificar que el usuario no tiene ya este logro
    const [existing] = await pool.query(
      'SELECT id FROM usuario_logros WHERE usuarioId = ? AND logroId = ?',
      [userId, achievementId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes este logro'
      });
    }

    // Agregar el logro al usuario
    await pool.query(
      'INSERT INTO usuario_logros (usuarioId, logroId, fecha) VALUES (?, ?, NOW())',
      [userId, achievementId]
    );

    console.log(`✅ Logro ${achievement[0].titulo} agregado al usuario ${userId}`);

    res.json({
      success: true,
      message: 'Logro agregado exitosamente'
    });
  } catch (error) {
    console.error('Error agregando logro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar logro'
    });
  }
});

// DELETE /api/achievements/remove/:achievementId - Eliminar logro del usuario
router.delete('/remove/:achievementId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { achievementId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM usuario_logros WHERE usuarioId = ? AND logroId = ?',
      [userId, achievementId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Logro no encontrado'
      });
    }

    console.log(`🗑️ Logro ${achievementId} eliminado del usuario ${userId}`);

    res.json({
      success: true,
      message: 'Logro eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando logro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar logro'
    });
  }
});

module.exports = router;
