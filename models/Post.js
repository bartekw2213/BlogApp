const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    markdown: String,
    date: {
        type: Date,
        default: new Date().toLocaleDateString()
    },
    author: String
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;