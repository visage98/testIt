const express = require('express');
const bp = require('body-parser');
const morgan = require('morgan');
const ejs = require('ejs');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const cp = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
mongoose.Promise = require('bluebird');

const userRouter = require('./routes/user');
const config = require('./config/config');
const passport = require('./config/passport');

mongoose.connect(config.database).then(function (db) {
    console.log("Database Connected!");
}).catch(function (err) {
    console.log(err.message);
});

const app = express();

app.use('/',express.static(path.join(__dirname,"public")));

app.use(morgan('dev'));
app.use(bp.json());
app.use(bp.urlencoded({extended : true}));

app.use(cp(config.secretKey));
app.use(session({
    resave : true,
    saveUninitialized : true,
    secret : config.secretKey,
    store : new MongoStore({url : config.database, autoReconnect: true})
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

app.engine('ejs',engine);
app.set('view engine','ejs');
app.use(userRouter);

let PORT = process.env.PORT || config.port;

app.listen(PORT,function(){
    console.log("Server started on http://localhost:"+PORT);
});