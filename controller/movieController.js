const {param} =require('./../routes/moviesRoutes');
const Movie=require('./../model/movieModel');
const ApiFeatures=require('./../utils/ApiFeatures');
const CustomError = require('../utils/CustomError');
const asyncErrorHandler=require('./../utils/asyncErrorHandler');


exports.getHighestRated=(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratings';
    next();
}


exports.createMovie=asyncErrorHandler(async(req,res,next)=>{
    // const testMovie=new Movie({});
    // testMovie.save();
    //try{
        const movie=await Movie.create(req.body);
        res.status(201).json({
            status:'success',
            data:{
                movie
            }
        })
    //}catch(err){
        // res.status(400).json({
        //     status:'fail',
        //     message:err.message
        // })
    }   
)

exports.getAllMovies=asyncErrorHandler(async(req,res,next)=>{
    //try{
        const features=new ApiFeatures(Movie.find(),req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        
        let movies=await features.query;
        //console.log(movies);
        //const movies=await Movie.find(req.query);
        res.status(200).json({
            status:"success",
            length:movies.length,
            data:{
                movies
            }
        })
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err.message
    //     })
    // }
})

exports.getMovie=asyncErrorHandler(async(req,res,next)=>{
    //try{
        const movie=await Movie.findById(req.params.id);

        if(!movie){
            const error=new CustomError('Movie with that ID is not found!',404);
            return next(error);
        }

        res.status(200).json({
            status:"success",
            data:{
                movies:movie
            }
        })
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err.message
    //     })
    // }
})

exports.updateMovie=asyncErrorHandler(async(req,res,next)=>{
    //try{
        const updateMovie=await Movie.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        
        if(!updateMovie){
            const error=new CustomError('Movie with that ID is not found!',404);
            return next(error);
        }

        res.status(200).json({
            status:"success",
            data:{
                movies:updateMovie
            }
        })
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err.message
    //     })
    // }
})

exports.deleteMovie=asyncErrorHandler(async(req,res,next)=>{
    //try{
        const deleteMovie=await Movie.findByIdAndDelete(req.params.id);
        
        if(!deleteMovie){
            const error=new CustomError('Movie with that ID is not found!',404);
            return next(error);
        }
        
        res.status(204).json({
            status:"success",
            data:null
        })
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err.message
    //     })
    // }
})