const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalmongoose=require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    }  
});

userSchema.plugin(passportLocalmongoose); //automatically create username,hashing and password
 
const User = mongoose.model("User", userSchema);

module.exports = User;