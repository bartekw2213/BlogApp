const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');

router.get('/', (req, res) => res.render('index'));

router.get('/logged', (req, res) => res.send('Welcome'));

router.get('/register', (req, res) => res.render('register', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }));

router.post('/register', async (req, res) => {
    const { username, email, password1, password2 } = req.body;

    // Checking if both passwords match
    if(password1 !== password2) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/register');
    }
    // Checking password length
    if(password1.length < 8 || password1.length > 25) {
        req.flash('error', 'Password have to be at least 9 and no longer than 25 characters');
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

router.get('/login', (req, res) => res.render('login', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }));

router.post('/login', passport.authenticate('local', {
    successRedirect: '/logged',
    failureRedirect: '/login',
    failureFlash: true
}))

module.exports = router;