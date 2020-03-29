const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');

function passportConfig(passport) {
    const authentication = async (username, password, done) => {
        const user = await User.findOne({username: username});

        if(!user) {
            return done(null, false, { message: 'No user with that email' });
        }

        bcrypt.compare(password, user.password, function(err, res) {
            if(res) {
                return done(null, user)
            }
            return done(null, false, { message: 'Wrong password' });
        });
    };

    passport.use(new LocalStrategy(authentication));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}

module.exports = passportConfig;