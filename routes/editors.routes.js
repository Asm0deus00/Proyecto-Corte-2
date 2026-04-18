const express = require('express');
const router = express.Router();
const EditorsDAO = require('../dao/editors.dao');

// Registro + Login combinado (ideal para demo)
router.post('/login', async (req, res) => {
  const { email, password, full_name = "Editor Demo" } = req.body;

  try {
    // Intentar encontrar usuario
    let editor = await EditorsDAO.findByEmail(email);

    if (!editor) {
      // Si no existe → lo creamos automáticamente
      console.log(`🆕 Registrando nuevo usuario: ${email}`);
      const newId = await EditorsDAO.create({
        full_name: full_name,
        email: email,
        password: password
      });
      
      editor = await EditorsDAO.findByEmail(email);
      console.log(`✅ Usuario creado con ID: ${newId}`);
    } else {
      // Si existe, verificamos contraseña
      if (editor.password !== password) {
        return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
      }
      console.log(`✅ Login exitoso para: ${email}`);
    }

    res.json({ 
      success: true, 
      message: editor ? "Login exitoso" : "Usuario registrado",
      editor 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;