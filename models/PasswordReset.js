const mongoose = require('mongoose');
const{isEmail}= require('validator');
const bcrypt = require('bcrypt');
//to create a database, create a model. To create a schema is to create a table)
const PasswordResetSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Please enter an email'],
        unique:true,
        lowercase:true,
        validate:[isEmail, ' Please enter a valid email']
    },
    userId: String,
    resetpassword:String,
    createdAt: Date,
    expiresAt: Date,

});

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema); //creates the database from the userschema. uses the name'user'+"s"

module.exports = PasswordReset;