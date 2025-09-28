const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mercado_agricola.db', (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos SQLite');
});

module.exports = db;