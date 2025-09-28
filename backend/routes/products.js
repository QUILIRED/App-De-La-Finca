const express = require('express');
const db = require('../db/connection');
const router = express.Router();

// Obtener todos los productos
router.get('/', (req, res) => {
  db.all('SELECT * FROM products WHERE vendedor_id IS NOT NULL ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(rows);
  });
});

// Agregar producto
router.post('/', (req, res) => {
  const { nombre, descripcion, precio, stock, imagen, vendedorId } = req.body;

  if (!vendedorId) {
    return res.status(400).json({ error: 'Vendedor ID requerido' });
  }

  db.run('INSERT INTO products (nombre, descripcion, precio, stock, imagen, vendedor_id) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, descripcion, precio, stock, imagen, vendedorId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al agregar producto' });
      }
      res.json({ message: 'Producto agregado', productId: this.lastID });
    });
});

// Actualizar producto
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, imagen } = req.body;

  db.run('UPDATE products SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ? WHERE id = ?',
    [nombre, descripcion, precio, stock, imagen, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar producto' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ message: 'Producto actualizado' });
    });
});

// Eliminar producto
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  });
});

module.exports = router;