const express = require('express');
const router = express.Router();

const Post = require('../../models/Post');

// Checking if the user have permission to the route
router.use((req, res, next) => {
    if(req.isAuthenticated()){
        next();
    } else{
        req.flash('error', 'You need to log in')
        res.redirect("/user/login");
    }
})

// Serving the main page
router.get('/', async (req, res) => {
    const posts = await Post.find({}).sort({date: -1});

    res.render('indexLogged', { errMsg: req.flash('error'), succMsg: req.flash('succMsg'), posts: posts })
});

// Serving the particular post
router.get('/post/:id', (req, res, next) => {
    if(!req.isAuthenticated()){
        res.redirect(`/post/${req.params.id}`)
    } else{
        next()
    }
}, async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    res.render('postLogged', { post: post })
})

// Serving post edit page
router.get('/post/edit/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);

    res.render('editPost', {post: post})
})

// Updating post
router.put('/post/edit/:id', async (req, res) => {
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

// Deleting post
router.delete('/post/delete/:id', (req, res) => {
    Post.deleteOne({ _id: req.params.id }, function (err) {
        if (err) return handleError(err);
        res.redirect('/logged')
      });
})

// Serving add post page
router.get('/addPost', (req, res) => res.render('addPost', { errMsg: req.flash('error'), succMsg: req.flash('succMsg') }))

// Adding post
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