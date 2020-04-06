const mongoose = require('mongoose');
const moment = require('moment');

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    markdown: String,
    formatedDate: {
        type: String,
        default: moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a')
    },
    date: {
        type: Date,
        default: Date.now
    },
    author: String
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;