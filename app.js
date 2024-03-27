const express = require('express');
const app = express();
const moviesRouter = require('./routes/moviesRoutes');
const authRouter = require('./routes/authRouter');
const CustomError=require('./utils/CustomError');
const globalErrorHandler=require('./controller/errorController');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });



app.use(express.json());

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {

    console.log('db connected')
})



// const testMovie=new Movie({
//     name:'Die hard',
//     description:'....',
//     duration:139,
//     ratings:4.5
// })
// testMovie.save().then(doc=>{
//     console.log(doc)
// }).catch(err=>{
//     console.log('error'+err)
// })

// const http=require('http');


// const server=http.createServer((request,response)=>{
// // //    response.end('hello');
// // //     console.log('request received');

// })

app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/users', authRouter);

//default route
app.all('*',(req,res,next)=>{
    //for default route
    // res.status(404).json({
    //     status:'fail',
    //     message:`can't find ${req.originalUrl} on the server!`
    // });

    //for global error
    // const err=new Error(`can't find ${req.originalUrl} on the server!`);
    // err.status='fail';
    // err.statusCode=404;

    //for custom error class
    const err=new CustomError(`can't find ${req.originalUrl} on the server!`,404);

    next(err);
})

//global error handling
app.use(globalErrorHandler);

const server=app.listen(8000, (err) => {
    console.log(err);
    console.log('server started');
});

process.on('unhandledRejection',(err)=>{
    console.log(err.name,err.message);
    console.log('unhandled rejection occured!shutting down...');

    server.close(()=>{
        process.exit(1);
    })
    
})
