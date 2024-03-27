const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const { login } = require('../controller/authController');
const crypto=require('crypto');

const userSchema=new mongoose.Schema({
    name:{
    type:String,
    required:[true,'Please Enter your Name']
    },
    email:{
        type:String,
        required:[true,'Please Enter an email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please enter a valid email']
    },
    photo:String,
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please enter a password'],
        minlength:0,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            validator:function(val){
                return val === this.password;
            },
            message:'Password and confirmPassword does not match'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))
        return next();
    this.password=await bcrypt.hash(this.password,12);

    this.confirmPassword=undefined;
    next();
})

userSchema.methods.comparePasswordInDb=async function(pswd,pswdDb){
    return await bcrypt.compare(pswd,pswdDb);
}

userSchema.methods.isPasswordChanged=async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const pswdChangedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
        console.log(pswdChangedTimestamp,JWTTimestamp);

        return JWTTimestamp<pswdChangedTimestamp;
    }
    return false;
}

userSchema.methods.createResetPasswordToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');

    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires=Date.now()*10*60*1000;

    console.log(resetToken,this.passwordResetToken);

    return resetToken;
}

const User=mongoose.model('User',userSchema);

module.exports=User;