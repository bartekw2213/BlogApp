const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../../models/User');

// Checking if the user is not already authenticated
router.use((req, res, next) => {
    !req.isAuthenticated() ? next() : res.redirect("/logged");
})

// Serving register page
router.get('/register', (req, res) => res.render('register', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }));

// Handling register POST method
router.post('/register', async (req, res) => {
    const { username, email, password1, password2 } = req.body;
    let error = ''; 

    // Checking if both passwords match
    if (password1 !== password2) error = 'Passwords do not match';
    // Checking password length
    if (password1.length < 5 || password1.length > 25) error = 'Password have to be at least 5 and no longer than 25 characters';
    // Check if user already exists by email
    if (await User.findOne({email: email})) error = 'User with that email already exists';
    // Check if user already exists by username
    if (await User.findOne({username: username})) error = 'User with that username already exists';

    if(error) {
        req.flash('error', error);
        return res.redirect('/user/register');
    }

    // Hashing password and storing to the database
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

// Serving login page
router.get('/login', (req, res) => res.render('login', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }));

// Handling login POST method
router.post('/login', passport.authenticate('local', {
    successRedirect: '/logged',
    failureRedirect: '/login',
    failureFlash: true
}))

module.exports = router;