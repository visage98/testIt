module.exports = {
    port : 4000,
    database : "*insert mongodb database link*",
    secretKey : "Secret",

    facebook:{
        clientID        : process.env.FACEBOOK_ID || '*FB app client id*',
        clientSecret    : process.env.FACEBOOK_SECRET || '*FB app client secret*',
        profileFields   : ['emails','displayName'],
        callbackURL     : '/auth/facebook/callback'
    }
}