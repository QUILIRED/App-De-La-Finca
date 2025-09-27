const express = require('express');
const db = require('../db');
const router = express.Router();

// Obtener sesiones de un usuario
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  db.all('SELECT * FROM sessions WHERE usuario_id = ? ORDER BY timestamp DESC', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener sesiones' });
    }
    res.json(rows);
  });
});

// Obtener todas las sesiones (para admin)
router.get('/', (req, res) => {
  db.all('SELECT s.*, u.nombre FROM sessions s JOIN users u ON s.usuario_id = u.id ORDER BY s.timestamp DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener sesiones' });
    }
    res.json(rows);
  });
});

module.exports = router;