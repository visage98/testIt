const router = require('express').Router();
const passport = require('../config/passport');
const config = require('../config/config');
const User = require('../models/users');
const Test = require('../models/tests');
const async = require('async');

function checkLoggedIn(req, res, next){
    if(req.user){
        next();
    } else {
        return res.redirect('/login');
    }
}

router.get('/login',function (req, res, next) {
    if(req.user) return res.redirect('/');
    res.render('accounts/login');
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope : 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect : '/profile',
    failureRedirect : '/login'
}));

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

router.get('/', function (req, res, next) {
    if(req.user){
        Test.find({public : true}, 'name code author endDate').populate('author').exec(function (err, tests) {
            if(err)
                return next(err);
            tests = tests.reduce(function (result, current) {
                if(new Date(current.endDate)>new Date()){
                    var date = current.endDate.getDate()+"-"+(current.endDate.getMonth()+1)+"-"+current.endDate.getFullYear();
                    var res = {
                        name : current.name,
                        code : current.code,
                        author : current.author.profile.name,
                        endDate : date
                    }
                    result.push(res);
                }
                return result;
            }, []);
            if(req.query.message=="end"){
                return res.render('accounts/home', {
                    user: req.user,
                    tests : tests,
                    message : "End Date Gone."
                });
            } else if(req.query.message=="given"){
                return res.render('accounts/home', {
                    user: req.user,
                    tests : tests,
                    message : "Test Already Given."
                });
            }
            else {
                return res.render('accounts/home', {
                    user: req.user,
                    tests : tests,
                    message: ""
                });
            }
        });
    } else {
        return res.render('mains/home');
    }
});

router.get('/profile',checkLoggedIn,function (req,res) {
    User.findOne({ _id: req.user._id }, function(err, user) {
        if (err) return next(err);
        Test.find({author : req.user._id},'name results passed', function (err, tests) {
            if(err) return next(err);
            res.render('accounts/profile', {
                user: user,
                tests : tests
            });
        });
    });
});


router.get('/create',checkLoggedIn, function (req, res , next) {
    User.findOne({ _id: req.user._id }, function(err, user) {
        if (err) return next(err);
        res.render('accounts/create', { user: user });
    });
});

router.post('/create', function (req, res, next) {
    console.log(req.body);
    let test = new Test();
    test.name  = req.body.name;
    test.maxTime = req.body.time;
    test.maxMarks = req.body.max_marks;
    test.passingMarks = req.body.passing_marks;
    test.passingComments = req.body.passing_comments;
    test.failingComments = req.body.failing_comments;
    test.endDate = req.body.end_date;
    test.author = req.user._id;
    test.public = false;
    if(req.body.public=='on'){
        test.public = true;
    }
    let qna = [];
    test.code = new Date().valueOf().toString(36);
    for(var i=0;i<req.body.length;i++){
        async.waterfall([
            function (callback) {
                qna[i] = {
                    question : req.body["q"+(i+1)],
                    marks : req.body["m"+(i+1)],
                    options : [],
                    correct: []
                };
                callback(null);
            },
            function () {
                for(var j=0;j<req.body["q"+(i+1)+"_length"];j++){
                    qna[i].options.push(req.body["q"+(i+1)+"_o"+(j+1)]);
                    if(req.body["q"+(i+1)+"_c"+(j+1)]){
                        qna[i]["correct"].push(true);
                    }
                    else{
                        qna[i]["correct"].push(false);
                    }
                }
            }
        ]);
    }
    test.qna = qna;
    test.save(function (err) {
        if(err){
            return next(err);
        }
        return res.render('accounts/afterCreate', {
            code : test.code
        });
    });
});

router.post('/', function (req, res, next) {
    res.redirect("/test?code="+req.body.test_code);
});

router.get('/test', function (req, res, next) {
    if(req.user){
        Test.findOne({code : req.query.code}).populate('author').exec(function (err, test) {
            async.waterfall([
                function (callback) {
                    if(err)
                        return next(err);
                    if(new Date(test.endDate)<new Date()){
                        return res.redirect("/?message=end");
                        callback(null,"done");
                    } else{
                        callback(null,"");
                    }
                },
                function (done,callback) {
                    if(done==="done"){
                        callback("done");
                    } else{
                        let flag=true;
                        User.findOne({_id : req.user._id},'scores', function (err, user) {
                            if(err) return next(err);
                            else{
                                for(var i=0;i<user.scores.length;i++){
                                    if(user.scores[i].testCode==test.code){
                                        flag=false;
                                        return res.redirect("/?message=given");
                                        callback(null,"done");
                                        break;
                                    }
                                }
                                if(flag){
                                    callback(null,"");
                                }
                            }
                        });
                    }
                },
                function (done) {
                    if(done===""){
                        return res.render('accounts/test', {
                            test : test,
                            user : req.user
                        });
                    }
                }
            ]);
        });
    } else
        return res.render('accounts/login');
});

router.post('/test', function (req, res, next) {
    Test.findOne({code : req.body.test_code}).populate('author').exec(function (err, test) {
        if(err) return next(err);
        total=0;
        for(var i=0;i<test.qna.length;i++){
            var flag = true;
            for(var j=0;j<test.qna[i].correct.length;j++){
                if(test.qna[i].correct[j]==true){
                    if(req.body["q"+(i+1)+"_c"+(j+1)]===undefined){
                        flag=false;
                        break;
                    }
                }
                if(test.qna[i].correct[j]==false){
                    if(req.body["q"+(i+1)+"_c"+(j+1)]){
                        flag=false;
                        break;
                    }
                }
            }
            if(flag==true){
                total+=parseInt(req.body["q"+(i+1)+"_marks"]);
            }
        }
        test.results.push({
            marks : total,
            examinee : req.user
        });
        User.findOne({_id : req.user._id}, function (err, user) {
            if(err) return next(err);
            user.scores.push({
                testCode : test.code,
                testName : test.name,
                author : test.author.profile.name,
                marks : total,
                maxMarks : test.maxMarks
            });
            user.save(function (err) {
                if(err) return next(err);
            });
        });
        var comment = test.failingComments;
        if(total>=test.passingMarks){
            comment = test.passingComments;
            test.passed = test.passed + 1;
        }
        test.save(function (err) {
            if(err) return next(err);
        });
        return res.render('accounts/result', {
            total : total,
            message : comment,
            code : test.code,
            maxMarks: test.maxMarks
        });
    });
});

router.get('/leaderboard', function (req, res, next) {
    code = req.query.code;
    page = parseInt(req.query.page);
    Test.findOne({code : code}, 'name code author results').populate('author results.examinee').exec(function (err, test) {
        if(err) return next(err);
        totalPages = (test.results.length/11)+1;
        result = [];
        for(var i=(page-1)*10;i<page*10&&i<test.results.length;i++){
            result.push(test.results[i]);
        }
        result.sort(function (a, b) {
            return b.marks-a.marks;
        });
        return res.render('mains/leaderboard',{
            name : test.name,
            code : test.code,
            author : test.author.profile.name,
            results : result,
            pages : parseInt(totalPages)
        });
    });
});

router.get('/privacypolicy', function (req, res, next) {
    return res.render('mains/privacy');
});
module.exports = router;