const User = require('../models/user');
const Product = require('../models/product');
// const PasswordReset= require('../models/PasswordReset');
const jwt = require('jsonwebtoken');
const e = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const smtpTransport = require('nodemailer-smtp-transport');
const Paystack = require('paystack');
const paystackObj = new Paystack(process.env.TEST_SECRET_KEY)

//nodemailer transporter
let transporter = nodemailer.createTransport((smtpTransport({
    service: 'gmail',
    auth:{
        user: "Levaredesign@gmail.com",
        pass: "hgxsublsuogcqbpf",
    },
})));

// //testing success
// transporter.verify((error, success)=>{
//     if (error){
//         console.log(error);
//     }
//     else{
//         console.log("Ready for message");
//         console.log(success);
//     }
// });

const handleErrors = (error) => {
    console.log(error.message, error.code)
    let err = {email: '', password: ''}; //based on the error message i want add different messages to the err object


    //incorrect email
    if (error.message === "incorrect email"){ //error.message from user error exception
        err.email = 'that email is not registered';
        return err;
    }

    //incorrect password
    if (error.message === "incorrect password"){
        err.password = 'that password is not registered';
        return err;
    }


    //duplicate error code
    if (error.code ===11000){ //error code from mongoose
        err.email = 'that email is already registered ';
        return err;
    }

    //validation errors
    if (error.message.includes('user validation failed')){ //if the error message should include 'user validation failed'
        Object.values(error.errors).forEach(({properties}) => { //from objects.values to error.errors, covert it to an arrray
            console.log(properties);
            err[properties.path]= properties.message;
        });
    }

    return err; 
}
const maxAge = 3*24*60*60;
const createToken = (id)=>{
    return jwt.sign({id},'net boy', {
        expiresIn: maxAge
    })
}
module.exports.signup_get = (req,res)=>{
    res.render('signup');
}
//.render goes straight to the views folder

module.exports.login_get = (req,res)=>{
    res.render('login');
}

module.exports.signup_post = async (req,res)=>{
    const {email, password,role} = req.body;
    
    try {
       const user = await User.create({email, password,role}); //create user from email and password to the db
       const token = createToken(user._id); //token generated using user id
       res.cookie('jwt', token, {httpOnly:true, maxAge: maxAge *1000});//setting the name and token on the broswer application tab
       res.status(201).json({user:user._id}); //shows up after you signup
    } 
    catch (error) {
        const err = handleErrors(error);
        res.status(400).json({err});
    }
}

module.exports.cart_post = async(req, res) =>{

}
module.exports.postProduct_post = async (req,res)=>{

    const {name, description, price,creator, image} = req.body;
    console.log("I'm here")
    console.log(req.body)
    try {
       const product = await Product.create({name, description, price, creator, image}); //create user from email and password to the db
       if(!product) {
        return res.status(500).send({error:'product not inserted'})
       }

       return res.status(200).json({message:"Product Posted",type:"success"});
    } 
    catch (error) {
        //const err = handleErrors(error);
        res.status(400).json({error:error.message});
    }
}

module.exports.login_post = async (req,res)=>{
    const {email, password} = req.body;

    try {
       const user = await User.login(email, password);
       const token = createToken(user._id);
       res.cookie('jwt', token, {httpOnly:true, maxAge: maxAge *1000});
       res.status(200).json({user: user._id})
    }
    catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({errors});
    }
}

module.exports.logout_get = (req, res)=>{
    res.cookie ('jwt', '', { maxAge:1 });
    res.redirect('/');
}
//session(JWT), local storage.store the role on the token..use different browsers to test the user role. 
//assign from code

module.exports.PasswordReset_get =(req,res)=>{
    res.render('forgetpassword');

}
module.exports.PasswordReset_post = async(req,res)=>{
    const {email} = req.body;
    let redirectUrl = (Math.random().toString(36).substr(2, 8));
    console.log("random", redirectUrl);

    console.log(email, redirectUrl)

    const finduser = await User.findOne({email:email})

    if(!finduser){
        return res.status(400).send({message:"This email doesnt exist"})
    }
    SendResetEmail(email, redirectUrl, res);
}
// //Send password reset email
    const SendResetEmail = async(email, redirectUrl, res)=>{
// //no we send the email
        if(email === null){
            return console.log({message:"no incoming email"})
        }
        console.log(email);
            const mailOptions= {
                from: "Lecaredesign@gmail.com",
                to: email,
                subject: 'Password Reset',
                html: `<p>Want to reset your password, visit  </p> <p>Here is your new Password:${redirectUrl}> to Proceed </p>`
            };
              //Hash reset string
            const saltRounds= 10;
             const hashpassword = await bcrypt.hash(redirectUrl, saltRounds)
                
                    const newUserPassword = await User.updateOne({email:email},{$set:{
                        password: hashpassword}})
               
                        if(!newUserPassword){
                            return console.log ("Error sending mail")
                        }
                        console.log('Password reset successfully')
                            
                        transporter
                            .sendMail(mailOptions)
                            .then(()=>{
                                //reset email sent and password record saved
                                res.json({
                                status: "PENDING",
                                message: "Password reset email sent",
                            })
                        })
                    
                        .catch(error => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Password reset email failed",
                            })

                        })                     


 }

module.exports.postProduct_get =(req,res)=>{
    res.render('postproduct', {User: "danielamoo35@gmail.com"});

}
module.exports.cart_get =(req,res)=>{
    res.render('cart');
}

module.exports.checkout_post =async (req,res)=>{
    // {email, amount}
    // 20000 == 200
    req.body.amount *= 100
    const {status, message, data} = await paystackObj.transaction.initialize(req.body);
    res.status(status).json({
        message, data
    })
}
// callback url
// module.exports.verify_transaction =async (req,res)=>{
//     // req.body.amount *= 100
//     const {reference} = req.query
//     const {status, message, data} = await paystackObj.transaction.verify(reference);
//     res.status(status).json({
//         message, data
//     })
// }
module.exports.checkout_get = (req, res)=>{
    res.render('checkout')
module.exports.checkout_post =(req, res)=>{
    
}
}