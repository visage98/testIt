module.exports = {
    port : 4000,
    database : "mongodb://root:abc123@ds245240.mlab.com:45240/testit",
    secretKey : "Secret",

    facebook:{
        clientID        : process.env.FACEBOOK_ID || '1620457874720007',
        clientSecret    : process.env.FACEBOOK_SECRET || 'a312ba65f5c9f680d6b04366474b4157',
        profileFields   : ['emails','displayName'],
        callbackURL     : '/auth/facebook/callback'
    }
}