const passport = require('passport');
const facebookStrategy = require('passport-facebook').Strategy;
const config = require('./config');
const User = require('../models/users');

passport.serializeUser(function (user, done) {
    return done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id,function(err, user){
        done(err, user);
    });
});

passport.use(new facebookStrategy(config.facebook, function (token, refreshToken, profile, done) {
    User.findOne({facebook : profile.id}, function (err, user) {
        if(err)
            return done(err);
        if(user) {
            return done(null, user);
        }
        else{
            User.findOne({email : profile._json.email}, function (err, existingUser) {
                if (err) done(err);
                if (existingUser) {
                    return done(null, existingUser);
                } else {
                    let newUser = new User();
                    newUser.email = profile._json.email;
                    newUser.facebook = profile.id;
                    newUser.tokens.push({kind : 'facebook',token : token});
                    newUser.profile.name = profile.displayName;
                    newUser.profile.picture = 'https://graph.facebook.com/'+profile.id+'/picture?type=large';

                    newUser.save(function (err) {
                        if(err) return done(err);
                        return done(null, newUser);
                    });
                }
            });
        }
    })
}));

module.exports = passport;