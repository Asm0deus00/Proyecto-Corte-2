const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',           // ← Aquí estaba el problema (estaba vacío)
  database: 'videotrack_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Debug automático al iniciar
pool.getConnection()
  .then(connection => {
    console.log("✅ CONEXIÓN A MYSQL EXITOSA - Base de datos: videotrack_db");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Error de conexión:", err.message);
  });

module.exports = pool;