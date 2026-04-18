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
const editorRoutes = require('./routes/editors.routes');
const clientRoutes = require('./routes/clients.routes');
const invoiceRoutes = require('./routes/invoices.routes');
const productionsRoutes = require('./routes/productions.routes'); // ✅ keep this

app.use('/api/editors', editorRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/productions', productionsRoutes); // ✅ NEW CORE ROUTE

// ❌ REMOVE tariffs completely
// const tariffRoutes = require('./routes/tariffs.routes');
// app.use('/api/tariffs', tariffRoutes);

// ====================== ROOT ======================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====================== SERVER ======================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});