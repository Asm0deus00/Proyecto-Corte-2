const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./dao/db');


const app = express();

// ====================== MIDDLEWARE ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================== STATIC FRONTEND ======================
app.use(express.static(path.join(__dirname, 'public')));

// ====================== DB CONNECTION TEST ======================
db.getConnection()
  .then(connection => {
    console.log("✅ Conexión a MySQL exitosa - Base de datos: videotrack_db");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Error al conectar con MySQL:", err.message);
  });

// ====================== ROUTES ======================
const clientsRoutes = require('./routes/clients.routes');
const productionsRoutes = require('./routes/productions.routes');
const invoicesRoutes = require('./routes/invoices.routes');
const editorsRoutes = require('./routes/editors.routes');

app.use('/api/clients', clientsRoutes);
app.use('/api/productions', productionsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/editors', editorsRoutes);

// ====================== ROOT ======================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====================== SERVER ======================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});