const express = require('express');
const router = express.Router();

const Post = require('../models/Post');

// Serving home page
router.get('/', (req, res, next) => {
    req.isAuthenticated() ? res.redirect('/logged') : next();
}, async (req, res) => {
    const posts = await Post.find({}).sort({date: 'desc'});

    res.render('index', { posts: posts })
});

// Serving post
router.get('/post/:id', (req, res, next) => {
    req.isAuthenticated() ? res.redirect(`/logged/post/${req.params.id}`) : next()
}, async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    res.render('post', { post: post })
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/user/login');
})


module.exports = router;