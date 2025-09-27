const express = require('express');
const db = require('../db');
const router = express.Router();

// Obtener todas las calificaciones
router.get('/', (req, res) => {
  db.all('SELECT * FROM ratings ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
    res.json(rows);
  });
});

// Agregar calificación
router.post('/', (req, res) => {
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Calificación debe estar entre 1 y 5' });
  }

  db.run('INSERT INTO ratings (rating) VALUES (?)', [rating], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al agregar calificación' });
    }
    res.json({ message: 'Calificación agregada', ratingId: this.lastID });
  });
});

// Obtener promedio de calificaciones
router.get('/average', (req, res) => {
  db.get('SELECT AVG(rating) as promedio, COUNT(*) as total FROM ratings', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al calcular promedio' });
    }
    res.json({ promedio: row.promedio || 0, total: row.total });
  });
});

module.exports = router;