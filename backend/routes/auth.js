const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { nombre, email, telefono, password, tipos } = req.body;

  if (!tipos || tipos.length === 0) {
    return res.status(400).json({ error: 'Debes seleccionar al menos un tipo de usuario.' });
  }

  try {
    // Verificar si el email ya existe
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (row) {
        return res.status(400).json({ error: 'El email ya está registrado.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const tiposStr = JSON.stringify(tipos);

      db.run('INSERT INTO users (nombre, email, telefono, password, tipos) VALUES (?, ?, ?, ?, ?)',
        [nombre, email, telefono, hashedPassword, tiposStr], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error al registrar usuario' });
          }

          // Registrar sesión de registro
          db.run('INSERT INTO sessions (usuario_id, action) VALUES (?, ?)', [this.lastID, 'register']);

          res.json({ message: 'Registro exitoso', userId: this.lastID });
        });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    // Registrar sesión de login
    db.run('INSERT INTO sessions (usuario_id, action) VALUES (?, ?)', [user.id, 'login']);

    // Migrar tipos si es necesario
    let tipos = user.tipos;
    if (typeof tipos === 'string') {
      tipos = JSON.parse(tipos);
    }

    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        tipos: tipos
      }
    });
  });
});

// Logout
router.post('/logout', (req, res) => {
   const { userId } = req.body;

   db.run('INSERT INTO sessions (usuario_id, action) VALUES (?, ?)', [userId, 'logout'], (err) => {
      if (err) {
         return res.status(500).json({ error: 'Error al registrar logout' });
      }
      res.json({ message: 'Logout registrado' });
   });
});


module.exports = router;