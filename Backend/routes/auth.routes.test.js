const express = require('express');
const router = express.Router();

// Ruta de prueba básica
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

module.exports = router;