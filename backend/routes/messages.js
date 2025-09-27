const express = require('express');
const db = require('../db');
const router = express.Router();

// Obtener mensajes entre dos usuarios
router.get('/:userId1/:userId2', (req, res) => {
  const { userId1, userId2 } = req.params;

  db.all(`SELECT m.*, u.nombre as de_nombre FROM messages m
          JOIN users u ON m.de_usuario_id = u.id
          WHERE (m.de_usuario_id = ? AND m.para_usuario_id = ?) OR (m.de_usuario_id = ? AND m.para_usuario_id = ?)
          ORDER BY m.timestamp ASC`,
    [userId1, userId2, userId2, userId1], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener mensajes' });
      }
      res.json(rows);
    });
});

// Enviar mensaje
router.post('/', (req, res) => {
  const { deUsuarioId, paraUsuarioId, mensaje } = req.body;

  db.run('INSERT INTO messages (de_usuario_id, para_usuario_id, mensaje) VALUES (?, ?, ?)',
    [deUsuarioId, paraUsuarioId, mensaje], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al enviar mensaje' });
      }
      res.json({ message: 'Mensaje enviado', messageId: this.lastID });
    });
});

module.exports = router;