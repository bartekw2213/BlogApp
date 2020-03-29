const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const isAuthenticated = require('../additionalFuncs/isAuthenticated');
const isNotAuthenticated = require('../additionalFuncs/isNotAuthenticated');

const User = require('../models/User');

router.get('/', isNotAuthenticated, (req, res) => res.render('index'));

router.get('/logged', isAuthenticated, (req, res) => res.render('indexLogged'));

router.get('/register', isNotAuthenticated, (req, res) => res.render('register', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }));

router.post('/register', async (req, res) => {
    const { username, email, password1, password2 } = req.body;

    // Checking if both passwords match
    if(password1 !== password2) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/register');
    }
    // Checking password length
    if(password1.length < 5 || password1.length > 25) {
        req.flash('error', 'Password have to be at least 5 and no longer than 25 characters');
        return res.redirect('/register');
    }
    // Check if user already exists by email
    const alreadyExists1 = await User.findOne({email: email});
    if(alreadyExists1) {
        req.flash('error', 'User with that email already exists');
        return res.redirect('/register');
    }
    // Check if user already exists by username
    const alreadyExists2 = await User.findOne({username: username});
    if(alreadyExists2) {
        req.flash('error', 'User with that username already exists');
        return res.redirect('/register');
    }

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password1, salt, function(err, hash) {
            if(err) throw new Error('Something went wrong');

            const user = new User({
                username,
                email,
                password: hash
            });

            user.save(function (err, user) {
                if (err) return console.error(err);
                req.flash('succMsg', 'You are successfully registered')
                res.redirect('/login')
              });
        });
    });
})

router.get('/login', isNotAuthenticated, (req, res) => res.render('login', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }));

router.post('/login', passport.authenticate('local', {
    successRedirect: '/logged',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
})

router.get('/addPost', isAuthenticated, (req, res) => res.render('addPost', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }))

module.exports = router;