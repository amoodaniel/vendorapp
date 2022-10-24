const mongoose = require('mongoose');
const{isEmail}= require('validator');
const bcrypt = require('bcrypt');
//to create a database, create a model. To create a schema is to create a table)
const{Schema} = mongoose;
mongoose.Promise = global.Promise;


const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Please enter an email'],
        unique:true,
        lowercase:true,
        validate:[isEmail, ' Please enter a valid email']
    },
    password:{
        type: String,
        required: [true, 'please enter a password'],
        minlength: [6, 'minimum password length is 6 characters']
    },
    role: String,
    createdAt: Date,
    expiresAt: Date,
});

// const PasswordResetSchema = new mongoose.Schema({
//     userId: String,
//     resetString: String,
//     createdAt: Date,
//     expiresAt: Date,
// });

//fire a function after item saved to db
userSchema.post('save', function(doc, next){ //(after)anytime the 'save' function is called, log the following message Doc-whateverdocument was saved
    console.log('new user was created and saved');
    next();
})


//fire a function before item is saved to db
userSchema.pre('save', async function(next){//before i save this is what should happen
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    console.log('User about to be created and saved',this);
    next();
});



//static method to login user
userSchema.statics.login = async function(email, password){//statics-the model itself|method - for all instances of the model
    const user = await this.findOne({email});//find the user with the email
    if (user){
        const auth = await bcrypt.compare(password, user.password); //compare input password with db password
        if (auth){
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

const User = mongoose.model('user', userSchema);
//creates the database from the userschema. uses the name'user'+"s"
// const PasswordReset =mongoose.model('PasswordReset', PasswordResetSchema);
module.exports = User;

// module.exports = PasswordReset;