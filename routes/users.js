const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const users = require('../controllers/users');

router.route('/register')
    .get(users.renderUserRegister)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(catchAsync(users.renderLogin))
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    users.usersLogin);

router.get('/logout', users.renderLogout);

module.exports = router;