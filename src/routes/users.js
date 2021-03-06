const express = require('express');
const res = require('express/lib/response');
const { route } = require('.');
const router = express.Router();

const User = require('../models/user');
const passport = require('passport');

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/users/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    const errors = [];
    console.log(req.body);
    if (name.length <= 0) {
        req.flash('error_msg', 'Escriba un nombre.');
    }
    if (email.length <= 0) {
        errors.push({text: 'Escriba un correo.'});
    }
    if (password != confirm_password) {
            errors.push({ text: 'Las contraseñas no coinciden' });
        }
    if (password.length < 4) {
        errors.push({ text: 'La contraseña debería ser de al menos 4 carácteres' });
    }
    if (errors.length > 0) {
        res.render('users/signup', {
            errors,
            name,
            email,
            password,
            confirm_password
        });
    }
    else {
        const emailUser = await User.findOne({ email: email });
        if (emailUser) {
            req.flash('error_msg', 'El correo está ya en uso.');
            res.redirect('/users/signup');
        }
        const newUser = new User({ name, email, password });
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', '¡Ya estas registrado!');
        res.redirect('/users/signin');
    }
});

router.get('/users/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

module.exports = router;