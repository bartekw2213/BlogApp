const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const isAuthenticated = require('../additionalFuncs/isAuthenticated');
const isNotAuthenticated = require('../additionalFuncs/isNotAuthenticated');

const User = require('../models/User');
const Post = require('../models/Post');

router.get('/', isNotAuthenticated, async (req, res) => {
    const posts = await Post.find({}).sort({date: 'desc'});

    res.render('index', { posts: posts })
});

router.get('/logged', isAuthenticated, async (req, res) => {
    const posts = await Post.find({}).sort({date: 'desc'});

    res.render('indexLogged', { errMsg: req.flash('error'), succMsg: req.flash('succMsg'), posts: posts })
});

router.get('/post/:id', (req, res, next) => {
    if(req.isAuthenticated()){
        res.redirect(`/logged/post/${req.params.id}`)
    } else{
        next()
    }
}, async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    res.render('post', { post: post })
})

router.get('/logged/post/:id', (req, res, next) => {
    if(!req.isAuthenticated()){
        res.redirect(`/post/${req.params.id}`)
    } else{
        next()
    }
}, async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    res.render('postLogged', { post: post })
})

router.get('/logged/post/edit/:id', isAuthenticated, async (req, res) => {
    const post = await Post.findById(req.params.id);

    res.render('editPost', {post: post})
})

router.put('/logged/post/edit/:id', isAuthenticated, async (req, res) => {
    const { title, description, markdown } = req.body;

    const post = await Post.findById(req.params.id);
    post.title = title;
    post.description = description;
    post.markdown = markdown;

    await post.save(function(err, post) {
        if(err) return console.log(err);
        req.flash('succMsg', 'Post was successfully updated')
        res.redirect('/logged');
    })
})

router.delete('/logged/post/delete/:id', isAuthenticated, (req, res) => {
    Post.deleteOne({ _id: req.params.id }, function (err) {
        if (err) return handleError(err);
        res.redirect('/logged')
      });
})

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

router.post('/addPost', (req, res) => {
    const { title, description, markdown } = req.body;
    const post = new Post({
        title,
        description,
        markdown,
        author: req.user.username
    });

    post.save(function (err, post) {
        if (err) return console.error(err);
        req.flash('succMsg', 'Article was added to the blog')
        res.redirect('/logged')
    });
})

module.exports = router;