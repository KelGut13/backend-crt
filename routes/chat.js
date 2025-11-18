const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/:friendId - Obtener o crear chat con un amigo
router.get('/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    console.log(`📨 Obteniendo/creando chat entre ${userId} y ${friendId}`);

    // Buscar chat existente (puede ser usuario1-usuario2 o usuario2-usuario1)
    let [chats] = await pool.query(
      `SELECT * FROM chats 
       WHERE (usuario1 = ? AND usuario2 = ?) OR (usuario1 = ? AND usuario2 = ?)`,
      [userId, friendId, friendId, userId]
    );

    let chatId;

    if (chats.length === 0) {
      // Crear nuevo chat si no existe
      const [result] = await pool.query(
        'INSERT INTO chats (usuario1, usuario2, creadoEn) VALUES (?, ?, NOW())',
        [userId, friendId]
      );
      chatId = result.insertId;
      console.log(`✅ Nuevo chat creado con ID: ${chatId}`);
    } else {
      chatId = chats[0].id;
      console.log(`✅ Chat existente encontrado con ID: ${chatId}`);
    }

    // Obtener mensajes del chat (incluir mensajes eliminados para mostrar placeholder)
    const [messages] = await pool.query(
      `SELECT m.*, u.username, u.photoURL 
       FROM mensajes m
       INNER JOIN users u ON m.deUsuario = u.id
       WHERE m.chatId = ?
       AND (m.eliminadoPara IS NULL OR NOT JSON_CONTAINS(m.eliminadoPara, ?, '$'))
       ORDER BY m.enviadoEn ASC`,
      [chatId, `"${userId}"`]
    );

    // Obtener información del amigo
    const [friendInfo] = await pool.query(
      `SELECT u.id, u.username, u.photoURL, u.isOnline
       FROM users u
       WHERE u.id = ?`,
      [friendId]
    );

    console.log(`👤 Info del amigo ${friendId}:`, friendInfo[0]);

    res.json({
      success: true,
      data: {
        chatId,
        messages,
        friend: friendInfo[0] || null
      }
    });
  } catch (error) {
    console.error('Error obteniendo chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener chat'
    });
  }
});

// POST /api/chat/:chatId/message - Enviar mensaje
router.post('/:chatId/message', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { mensaje } = req.body;
    const userId = req.user.userId;

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede estar vacío'
      });
    }

    console.log(`💬 Enviando mensaje al chat ${chatId} desde usuario ${userId}`);

    // Verificar que el usuario es parte del chat
    const [chats] = await pool.query(
      'SELECT * FROM chats WHERE id = ? AND (usuario1 = ? OR usuario2 = ?)',
      [chatId, userId, userId]
    );

    if (chats.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Insertar mensaje
    const [result] = await pool.query(
      'INSERT INTO mensajes (chatId, deUsuario, mensaje, enviadoEn) VALUES (?, ?, ?, NOW())',
      [chatId, userId, mensaje.trim()]
    );

    // Obtener el mensaje completo con datos del usuario
    const [newMessage] = await pool.query(
      `SELECT m.*, u.username, u.photoURL 
       FROM mensajes m
       INNER JOIN users u ON m.deUsuario = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    console.log(`✅ Mensaje enviado con ID: ${result.insertId}`);

    res.json({
      success: true,
      data: newMessage[0]
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje'
    });
  }
});

// GET /api/chat/messages/:chatId - Obtener mensajes de un chat (para polling)
router.get('/messages/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { lastMessageId } = req.query; // Para obtener solo mensajes nuevos
    const userId = req.user.userId;

    // Verificar que el usuario es parte del chat
    const [chats] = await pool.query(
      'SELECT * FROM chats WHERE id = ? AND (usuario1 = ? OR usuario2 = ?)',
      [chatId, userId, userId]
    );

    if (chats.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    // Obtener mensajes (solo nuevos si se proporciona lastMessageId)
    // Incluir mensajes eliminados para mostrar placeholder en tiempo real
    let query = `
      SELECT m.*, u.username, u.photoURL 
      FROM mensajes m
      INNER JOIN users u ON m.deUsuario = u.id
      WHERE m.chatId = ?
      AND (m.eliminadoPara IS NULL OR NOT JSON_CONTAINS(m.eliminadoPara, ?, '$'))
    `;
    const params = [chatId, `"${userId}"`];

    if (lastMessageId) {
      query += ' AND m.id > ?';
      params.push(lastMessageId);
    }

    query += ' ORDER BY m.enviadoEn ASC';

    const [messages] = await pool.query(query, params);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
});

// GET /api/chat/updates/:chatId - Obtener actualizaciones de mensajes (eliminados, editados)
router.get('/updates/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.query; // IDs de mensajes a verificar, separados por coma
    const userId = req.user.userId;

    if (!messageIds) {
      return res.json({
        success: true,
        data: { deletedMessages: [] }
      });
    }

    const idsArray = messageIds.split(',').map(id => parseInt(id));

    // Verificar cuáles mensajes fueron eliminados
    const [messages] = await pool.query(
      `SELECT id, eliminado 
       FROM mensajes 
       WHERE id IN (?) AND chatId = ? AND eliminado = TRUE`,
      [idsArray, chatId]
    );

    res.json({
      success: true,
      data: {
        deletedMessages: messages.map(m => m.id)
      }
    });
  } catch (error) {
    console.error('Error obteniendo actualizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actualizaciones'
    });
  }
});

// GET /api/chat/list - Obtener lista de chats del usuario
router.get('/list/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`📋 Obteniendo lista de chats para usuario ${userId}`);

    // Obtener chats con último mensaje y datos del otro usuario
    const [chats] = await pool.query(
      `SELECT 
        c.id as chatId,
        c.creadoEn,
        CASE 
          WHEN c.usuario1 = ? THEN u2.id
          ELSE u1.id
        END as friendId,
        CASE 
          WHEN c.usuario1 = ? THEN u2.username
          ELSE u1.username
        END as friendUsername,
        CASE 
          WHEN c.usuario1 = ? THEN u2.photoURL
          ELSE u1.photoURL
        END as friendPhotoURL,
        CASE 
          WHEN c.usuario1 = ? THEN u2.isOnline
          ELSE u1.isOnline
        END as friendIsOnline,
        (SELECT mensaje FROM mensajes WHERE chatId = c.id ORDER BY enviadoEn DESC LIMIT 1) as lastMessage,
        (SELECT enviadoEn FROM mensajes WHERE chatId = c.id ORDER BY enviadoEn DESC LIMIT 1) as lastMessageTime,
        (SELECT COUNT(*) FROM mensajes WHERE chatId = c.id AND deUsuario != ? AND leido = FALSE) as unreadCount
      FROM chats c
      INNER JOIN users u1 ON c.usuario1 = u1.id
      INNER JOIN users u2 ON c.usuario2 = u2.id
      WHERE c.usuario1 = ? OR c.usuario2 = ?
      ORDER BY lastMessageTime DESC`,
      [userId, userId, userId, userId, userId, userId, userId]
    );

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error obteniendo lista de chats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener chats'
    });
  }
});

// PUT /api/chat/:chatId/mark-read - Marcar mensajes como leídos
router.put('/:chatId/mark-read', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Marcar como leídos todos los mensajes que no son del usuario
    await pool.query(
      'UPDATE mensajes SET leido = TRUE WHERE chatId = ? AND deUsuario != ? AND leido = FALSE',
      [chatId, userId]
    );

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos'
    });
  } catch (error) {
    console.error('Error marcando mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar mensajes'
    });
  }
});

// DELETE /api/chat/message/:messageId - Eliminar mensaje
router.delete('/message/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.body; // 'for-me' o 'for-everyone'
    const userId = req.user.userId;

    console.log(`🗑️ Eliminando mensaje ${messageId} (tipo: ${deleteType}) para usuario ${userId}`);

    // Verificar que el mensaje existe y obtener datos
    const [messages] = await pool.query(
      'SELECT * FROM mensajes WHERE id = ?',
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    const message = messages[0];

    // Verificar que el usuario es parte del chat
    const [chats] = await pool.query(
      'SELECT * FROM chats WHERE id = ? AND (usuario1 = ? OR usuario2 = ?)',
      [message.chatId, userId, userId]
    );

    if (chats.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este chat'
      });
    }

    if (deleteType === 'for-everyone') {
      // Solo el creador del mensaje puede eliminar para todos
      if (message.deUsuario !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes eliminar tus propios mensajes para todos'
        });
      }

      // Soft delete - marcar como eliminado en lugar de borrar físicamente
      await pool.query('UPDATE mensajes SET eliminado = TRUE WHERE id = ?', [messageId]);

      console.log(`✅ Mensaje ${messageId} eliminado para todos (soft delete)`);

      res.json({
        success: true,
        message: 'Mensaje eliminado para todos',
        deletedForEveryone: true,
        messageId: messageId
      });
    } else {
      // Eliminar solo para mí - agregar userId al campo eliminadoPara
      let eliminadoPara = {};
      
      if (message.eliminadoPara) {
        try {
          eliminadoPara = JSON.parse(message.eliminadoPara);
        } catch (e) {
          console.error('Error parseando eliminadoPara:', e);
        }
      }

      eliminadoPara[userId] = true;

      await pool.query(
        'UPDATE mensajes SET eliminadoPara = ? WHERE id = ?',
        [JSON.stringify(eliminadoPara), messageId]
      );

      console.log(`✅ Mensaje ${messageId} eliminado para usuario ${userId}`);

      res.json({
        success: true,
        message: 'Mensaje eliminado para ti',
        deletedForEveryone: false
      });
    }
  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mensaje'
    });
  }
});

module.exports = router;
