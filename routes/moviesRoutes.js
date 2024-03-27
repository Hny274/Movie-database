const express=require('express');
const moviesController=require('./../controller/movieController');
const router=express.Router();
const authController=require('./../controller/authController');

//const moviesController=require('./../controller/movieController')

router.route('/highest-rated').get(moviesController.getHighestRated, moviesController.getAllMovies)

router.route('/')
    .post(moviesController.createMovie)
    .get(authController.protect,moviesController.getAllMovies)

router.route('/:id')
    .get(authController.protect,moviesController.getMovie)
    .patch(moviesController.updateMovie)
    .delete(authController.protect,//authController.restrict('admin'),
    moviesController.deleteMovie)

module.exports=router

