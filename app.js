const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportConfig = require('./passport-config/passport-config');

const app = express();

// MongoDB connection
mongoose.connect(require('./config/atlasURI').URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));


app.set('view engine', 'ejs');

// Bringing the passport configuration
passportConfig(passport);

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use('/', require('./routes/router'));

// Setting server to listen 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));