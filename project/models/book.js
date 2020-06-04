var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var BookSchema = new mongoose.Schema({
    username:String,
    noofrooms:Number,
    curdate:Date,
    arrdate:Date,
    price:Number
});

BookSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("booking",BookSchema);