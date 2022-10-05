var express = require('express');
var router = express.Router();

// controller
const userController = require('../controllers/user.controller');

/* GET users listing. */
router.get('/', userController.read);
router.get('/:id', userController.readById);
router.post('/', userController.signup);
router.patch('/:id', userController.update);
router.delete('/:id', userController.destroy);
router.post('/signin', userController.signin);

module.exports = router;
