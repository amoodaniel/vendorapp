//Created a middleware for every route, 

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { use } = require('../routes/authRoutes');
// const PasswordReset = require('../models/PasswordReset');


const requireAuth = (req, res, next) =>{ //the name of omy middleware is requireAuth
    const token = req.cookies.jwt; //trying to access the jwt that's in the browser

    //check json web token if it exists and is verified verify token
    if (token){ //if the value of the token is not empty
        jwt.verify(token, 'net boy', (err, decodedToken) =>{
            if(err){
                console.log(err.message);
                res.redirect('/login');
            }
            else{
                console.log(decodedToken);
                next();
            }
        });
    }

    else {
        res.redirect('/login');
    }  
} 

//check current user
const checkUser = (req, res, next)=>{
    const token = req.cookies.jwt;

    if (token){
        jwt.verify(token, 'net boy', async (err, decodedToken) =>{
            if(err){
                console.log(err.message);
                res.locals.user = null;
                next();
            }
            else{
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });

    }
    else{
        res.locals.user = null;
        next();
    }
}
const checkVendor=(req,res,next)=>{
    const token = req.cookies.jwt;

    if (token){
        jwt.verify(token, 'net boy', async (err, decodedToken) =>{
            let user = await User.findById(decodedToken.id);
            if(user.role==='Vendor'){
                    next();
                }
            else{
                res.redirect('/');
            }
            }
        )};
    
}
module.exports = {requireAuth, checkUser, checkVendor};