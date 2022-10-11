var express = require('express');
var router = express.Router();

// controller
const userController = require('../controllers/user.controller');

// middleware
const authMiddleware = require('../middlewares/auth');

/* GET users listing. */
router.get('/', authMiddleware.auth, userController.read);
router.get('/:id', authMiddleware.auth, userController.readById);
router.post('/', userController.signup);
router.patch('/:id', authMiddleware.auth, userController.update);
router.delete('/:id', authMiddleware.auth, userController.destroy);
router.post('/signin', userController.signin);

module.exports = router;
