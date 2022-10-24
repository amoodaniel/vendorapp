const { Router } = require("express");
const authController = require('../controllers/authcontroller');

const rou = Router();

rou.get('/signup', authController.signup_get);
rou.post('/signup', authController.signup_post);

//Forgot password
//rpu.get(shows's the page)
rou.get('/forgetpassword', authController.PasswordReset_get);
//rou.post(submits the form or the logic) 
rou.post('/forgetpassword', authController.PasswordReset_post);
//nodemailer

rou.get('/login', authController.login_get);
rou.post('/login', authController.login_post);

rou.get('/logout', authController.logout_get);

rou.get('/postproduct', authController.postProduct_get);
rou.post('/postproduct', authController.postProduct_post);

rou.get('/cart', authController.cart_get);

rou.get('')

module.exports = rou;

