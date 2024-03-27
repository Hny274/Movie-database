const mongoose=require('mongoose');
const fs=require('fs');
const validator=require('validator');

const movieSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required'],
        unique:true,
        maxlength:[100,'Movie name must not have more than 100 characters'],
        minlength:[4,'Movie name have at least 4 characters'],
        trim:true,
        //validate:[validator.isAlpha,'Name should only contain alphabets']
    },
    description:{
        type:String,
        required:[true,'desc is required'],
        unique:true,
        trim:true
    },
    duration:{
        type:Number,
        required:[true,'duration is required']
    },
    ratings:{
        type:Number,
        // min:[1,'Ratings must be 1.0 or above'],
        // max:[10,'Ratings must be above 10'],
        validate:{
            validator:function(value){
                return value >= 1 && value <= 10;
            },
            message:'Ratings shoud be above 1 and below 10'
    },
        default:1.0
    },
    totalRating:{
        type:Number,
    },
    releaseYear:{
        type:Number,
        //required:[true,'release-year is required']
    },
    releaseDate:{
        type:Date,
        //required:[true,'release-year is required']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    genres:{
        type:[String],
        required:[true,'genres is required']
    },
    directors:{
        type:[String],
        required:[true,'Directors is required']
    },
    coverImage:{
        type:String,
        //required:[true,'cover Image is required']
    },
    actors:{
        type:[String],
        required:[true,'Actors is required']
    },
    price:{
        type:Number,
        required:[true,'price is required']
    },
    createdBy:String
})

//docMiddleware
movieSchema.pre('save',function(next){
    //console.log(this);
    this.createdBy='MANOHJA';
    next();
})

movieSchema.post('save',function(doc,next){
    const content=`A new movie doc with new ${doc.name} has been created by ${doc.createdBy}\n`;
    fs.writeFileSync('./log/log.txt',content,{flag:'a'},(err)=>{
        console.log(err.message);
    })
    next();
})

//queryMiddleware
// movieSchema.pre(/^find/,function(next){
//     this.find({releaseDate:{$lte:Date.now()}});
//     this.startTime=Date.now();
//     next();
// })

// movieSchema.post(/^find/,function(docs,next){
//     this.find({releaseDate:{$lte:Date.now()}});
//     this.endTime=Date.now();

//     const content=`Query took ${this.endTime=this.startTime} ms to fetch the docs. `;
//     fs.writeFileSync('./log/log.txt',content,{flag:'a'},(err)=>{
//         console.log(err.message);
//     })
//     next();
// })


const Movie=mongoose.model('Movie',movieSchema)


module.exports=Movie;