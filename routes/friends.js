const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/friends/search?q=username - Buscar usuarios por username
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.userId;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Buscar usuarios que coincidan con el término de búsqueda (excluyendo al usuario actual)
    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.gamerId, 
        u.nombres, 
        u.primerApellido, 
        u.segundoApellido, 
        u.username, 
        u.photoURL,
        CASE
          WHEN a1.estado = 'aceptada' OR a2.estado = 'aceptada' THEN 'aceptada'
          WHEN a1.estado = 'pendiente' AND a1.usuario1 = ? THEN 'enviada'
          WHEN a2.estado = 'pendiente' AND a2.usuario2 = ? THEN 'recibida'
          ELSE NULL
        END as friendshipStatus
       FROM users u
       LEFT JOIN amigos a1 ON u.id = a1.usuario2 AND a1.usuario1 = ?
       LEFT JOIN amigos a2 ON u.id = a2.usuario1 AND a2.usuario2 = ?
       WHERE (u.username LIKE ? OR u.nombres LIKE ? OR u.primerApellido LIKE ?) 
       AND u.id != ?
       LIMIT 20`,
      [currentUserId, currentUserId, currentUserId, currentUserId, `%${q}%`, `%${q}%`, `%${q}%`, currentUserId]
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios'
    });
  }
});

// POST /api/friends/send-request - Enviar solicitud de amistad
router.post('/send-request', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.userId;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del amigo'
      });
    }

    if (userId === friendId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviarte una solicitud a ti mismo'
      });
    }

    // Verificar si ya existe una relación (amigos o solicitud pendiente)
    const [existingRelation] = await pool.query(
      'SELECT id, estado FROM amigos WHERE (usuario1 = ? AND usuario2 = ?) OR (usuario1 = ? AND usuario2 = ?)',
      [userId, friendId, friendId, userId]
    );

    if (existingRelation.length > 0) {
      const status = existingRelation[0].estado;
      if (status === 'aceptada') {
        return res.status(400).json({
          success: false,
          message: 'Ya son amigos'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una solicitud pendiente'
        });
      }
    }

    // Crear solicitud de amistad con estado 'pendiente'
    await pool.query(
      'INSERT INTO amigos (usuario1, usuario2, estado, fechaAmistad) VALUES (?, ?, "pendiente", NOW())',
      [userId, friendId]
    );

    console.log(`📨 Solicitud de amistad enviada: ${userId} -> ${friendId}`);

    res.json({
      success: true,
      message: 'Solicitud de amistad enviada'
    });
  } catch (error) {
    console.error('Error enviando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar solicitud'
    });
  }
});

// GET /api/friends/requests - Obtener solicitudes de amistad pendientes
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener solicitudes PENDIENTES donde el usuario actual es usuario2 (recibidas)
    const [requests] = await pool.query(
      `SELECT a.id as requestId, a.fechaAmistad,
              u.id, u.gamerId, u.nombres, u.primerApellido, u.segundoApellido, u.username, u.photoURL
       FROM amigos a
       INNER JOIN users u ON a.usuario1 = u.id
       WHERE a.usuario2 = ? AND a.estado = 'pendiente'
       ORDER BY a.fechaAmistad DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes'
    });
  }
});

// PUT /api/friends/accept/:requestId - Aceptar solicitud de amistad
router.put('/accept/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    // Verificar que la solicitud existe, es para este usuario y está pendiente
    const [requests] = await pool.query(
      'SELECT * FROM amigos WHERE id = ? AND usuario2 = ? AND estado = "pendiente"',
      [requestId, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o ya procesada'
      });
    }

    // Actualizar el estado a 'aceptada'
    await pool.query(
      'UPDATE amigos SET estado = "aceptada" WHERE id = ?',
      [requestId]
    );

    console.log(`✅ Solicitud de amistad aceptada: ${requestId}`);

    res.json({
      success: true,
      message: 'Solicitud aceptada'
    });
  } catch (error) {
    console.error('Error aceptando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aceptar solicitud'
    });
  }
});

// DELETE /api/friends/reject/:requestId - Rechazar solicitud de amistad
router.delete('/reject/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    // Eliminar la solicitud
    const [result] = await pool.query(
      'DELETE FROM amigos WHERE id = ? AND usuario2 = ?',
      [requestId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    console.log(`❌ Solicitud de amistad rechazada: ${requestId}`);

    res.json({
      success: true,
      message: 'Solicitud rechazada'
    });
  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud'
    });
  }
});

// GET /api/friends/list - Obtener lista de amigos ACEPTADOS
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener amigos ACEPTADOS (donde el usuario es usuario1 o usuario2)
    const [friends] = await pool.query(
      `SELECT DISTINCT u.id, u.gamerId, u.nombres, u.primerApellido, u.segundoApellido, u.username, u.photoURL, u.isOnline
       FROM amigos a
       INNER JOIN users u ON (
         CASE 
           WHEN a.usuario1 = ? THEN u.id = a.usuario2
           WHEN a.usuario2 = ? THEN u.id = a.usuario1
         END
       )
       WHERE (a.usuario1 = ? OR a.usuario2 = ?) AND a.estado = 'aceptada'`,
      [userId, userId, userId, userId]
    );

    console.log(`👥 Amigos de usuario ${userId}:`, friends.map(f => ({ id: f.id, username: f.username, isOnline: f.isOnline })));

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    console.error('Error obteniendo amigos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener amigos'
    });
  }
});

// DELETE /api/friends/remove/:friendId - Eliminar amigo
router.delete('/remove/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Eliminar la relación de amistad
    const [result] = await pool.query(
      'DELETE FROM amigos WHERE (usuario1 = ? AND usuario2 = ?) OR (usuario1 = ? AND usuario2 = ?)',
      [userId, friendId, friendId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Amistad no encontrada'
      });
    }

    console.log(`🗑️ Amistad eliminada: ${userId} <-> ${friendId}`);

    res.json({
      success: true,
      message: 'Amigo eliminado'
    });
  } catch (error) {
    console.error('Error eliminando amigo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar amigo'
    });
  }
});

module.exports = router;
