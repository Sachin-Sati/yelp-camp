const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const users = require('../controllers/users');
const passport = require('passport');

const router = express.Router();

// Register Route
router.get('/register', users.registerForm);

router.post('/register', wrapAsync(users.registerUser));

// Login Routes
router.get('/login', users.loginForm);

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.loginUser);

// Logout Routes
router.get('/logout', users.logoutUser);

module.exports = router;