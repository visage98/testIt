const mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
let crypto = require('crypto');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    email : {type : String, unique : true},
    password : String,

    facebook : String,
    tokens : Array,
    profile : {
        name : {type: String, default : ""},
        picture : {type: String, default:""}
    },
    scores : [{
        testCode : String,
        testName : String,
        author : String,
        marks : Number,
        maxMarks : Number
    }]
});

UserSchema.pre('save', function (next) {
    let user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if(err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User',UserSchema);