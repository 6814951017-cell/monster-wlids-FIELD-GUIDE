const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { requireAuth, isAdminUser } = require('../middlewares/auth.middleware')

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', requireAuth, (req, res) => res.json({
  id: req.user._id,
  name: req.user.name,
  email: req.user.email,
  isAdmin: isAdminUser(req.user),
}));

module.exports = router;
