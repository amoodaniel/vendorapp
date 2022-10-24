const mongoose = require('mongoose');
const{isEmail}= require('validator');
const { ObjectId } = require('mongoose');
const {objectId}= mongoose.Schema.Types;

const productSchema = new mongoose.Schema({
    name:String,
    description: String,
    price: Number,
    creator:{
        type: String,
        required: [true, 'Please enter an email'],
        unique:true,
        lowercase:true,
        validate:[isEmail, ' Please enter a valid email']
    }
    
})


const Product = mongoose.model('product', productSchema);
module.exports=Product;