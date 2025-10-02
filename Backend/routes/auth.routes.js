const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Rutas públicas con rate limiting
router.post('/register', 
  authLimiter,
  validateRegister,
  handleValidationErrors,
  authController.register
);

router.post('/login', 
  authLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

// Rutas protegidas
router.post('/logout', 
  auth, 
  authController.logout
);

router.get('/profile', 
  auth, 
  authController.getProfile
);

router.put('/profile', 
  auth,
  [
    body('nombre')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Debe proporcionar un email válido')
      .normalizeEmail()
  ],
  handleValidationErrors,
  authController.updateProfile
);

router.put('/change-password', 
  auth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La nueva contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial')
  ],
  handleValidationErrors,
  authController.changePassword
);

// Ruta para refrescar token
router.post('/refresh', authController.refreshToken);

module.exports = router;