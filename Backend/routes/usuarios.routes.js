const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateUserCreate, validateUserUpdate, validateUserRole, handleValidationErrors } = require('../middleware/validation');
const { logger } = require('../middleware/logger');

// Todas las rutas requieren autenticación y rol de admin
router.use(auth);
router.use(authorize('admin'));

// Rutas para gestión de usuarios
router.get('/', userController.getAllUsers);
router.post('/', validateUserCreate, handleValidationErrors, userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', validateUserUpdate, handleValidationErrors, userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/role', validateUserRole, handleValidationErrors, userController.changeUserRole); // Para cambiar solo el rol

module.exports = router;