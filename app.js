const express = require('express');
const mongoose = require('mongoose');
const authroutes = require('./routes/authRoutes')
const cookiebro = require('cookie-parser');
const{requireAuth, checkUser, checkVendor} = require('./middleware/authMiddleware');
const Product = require('./models/product');
const User = require('./models/user');
const { response } = require('express');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookiebro());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://amoo:admin123@loginapp.70moa.mongodb.net/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000, () => console.log(`Server running ${3000}` )))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/postproduct', checkVendor);

app.get('/smoothies',requireAuth, async(req, res) =>{
  try {
    const getData  = await Product.find()
    res.render('smoothies',{response:getData})
  } catch (error) {
    console.log(error)
  }
} );

app.get('/cart',(req, res) =>{
  try {
    const getFunds = []
    res.render('cart', {response:getFunds})
  }
  catch(err){
    console.log(err)
  }
});

app.use(authroutes); //add other routes from the auth routes to this main js file

