const { log } = require('console');
const CustomError = require('../utils/CustomError');
const User=require('./../model/userModel');
const asyncErrorHandler=require('./../utils/asyncErrorHandler');
const jwt=require('jsonwebtoken');
const util=require('util');
const sendEmail=require('./../utils/email');
const crypto=require('crypto');

const signToken=id=>{
    return jwt.sign({id},process.env.SECRET_STR,{
        expiresIn:process.env.LOGIN_EXPIRES
    })
}

exports.signup=asyncErrorHandler(async(req,res,next)=>{
    const newUser=await User.create(req.body);

    // const token=jwt.sign({id:newUser._id},process.env.SECRET_STR,{
    //     expiresIn:process.env.LOGIN_EXPIRES
    // })

    const token=signToken(newUser._id)

    res.status(201).json({
        status:"success",
        token,
        data:{
            user:newUser
        }
    })
})

exports.login=asyncErrorHandler(async(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;

    if(!email || !password){
        const error=new CustomError('Please provide email and password for login in',400);
        return next(error);
    }

    //check if user exists with given email
    const user=await User.findOne({email}).select('+password');

    //const isMatch=await User.comparePasswordInDb(password,user.password);

    //check if user exist and password matches
    if(!user || !(await user.comparePasswordInDb(password,user.password))){
        const error=new CustomError('Incorrect email or password',400);
        return next(error);
    }

    const token=signToken(user._id);

    res.status(200).json({
        status:'success',
        token
    })
})

exports.protect=asyncErrorHandler(async(req,res,next)=>{
    //1.Read the token & check if it exist
    const testToken=req.headers.authorization
    let token; 
    if(testToken && testToken.startsWith('bearer')){
        token=testToken.split(' ')[1];
    }
    if(!token){
        next(new CustomError('You are not logged in!',401))
    }
    //console.log(token);

    //2.validate the token
    const decodeToken=await util.promisify(jwt.verify)(token,process.env.SECRET_STR);
    console.log(decodeToken);

    //3.If the user exist
    const user=await User.findById(decodeToken.id);

    if(!user){
        const error=new CustomError('The user with given token does not exist',401);
        next(error);
    }

    //4.If the user changed password after the token was issued
    const isPasswordChanged=await user.isPasswordChanged(decodeToken.iat);
    if(isPasswordChanged){
        const error=new CustomError('The password has been changed recently.Please login again',401);
        return next(error);
    };

    //5.Allow user to access route
    req.user=user;
    next();
})


// exports.restrict=(role)=>{
//     return (req,res,next)=>{
//         if(req.user.role !== role){
//             const error=new CustomError('You do not have permission to perform this action',403);
//             next(error);
//         }
//         next();
//     }
// }

exports.forgotPassword=asyncErrorHandler(async(req,res,next)=>{
    //1.get user based on posted email
    const user=await User.findOne({email:req.body.email});

    if(!user){
        const error=new CustomError('We could not find the user with given mail',404);
        next(error);
    }

    //2.generate a random reset token
    const resetToken=user.createResetPasswordToken();

    await user.save({validateBeforeSave:false});

    //3.send the token back to the user email
    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/users/this.passwordReset/${resetToken}`;
    const message=`We have received a password reset request.Please usse the below link to reset your password\n\n${resetUrl}\n\n This reset password link only valid for 10 mins.`
    try{
        await sendEmail({
        email:user.email,
        subject:'Password change request received',
        message:message
    });
    res.status(200).json({
        status:'success',
        message:'Password reset link send to the user email'
    })
    }catch(err){
        user.passwordResetToken=undefined;
        user.passwordResetTokenExpires=undefined;
        user.save({validateBeforeSave:false});

        return next(new CustomError('There was an error sending password reset email.Please try again later',500));
    }   
})

exports.passwordReset=asyncErrorHandler(async(req,res,next)=>{
    //if the user exists eith the given token & token was not expired
    const token=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({passwordResetToken:token,passwordResetTokenExpires:{$gt:Date.now()}});

    if(!user){
        const error=new CustomError('Token is invalid or has expired',400);
        next(error);
    }

    //reseting the user password
    user.password=req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    user.passwordResetToken=undefined;
    user.passwordResetTokenExpires=undefined;
    user.passwordChangedAt=Date.now();

    user.save();

    //login user
    const loginToken=signToken(user._id);

    res.status(200).json({
        status:'success',
        token:loginToken
    })
})