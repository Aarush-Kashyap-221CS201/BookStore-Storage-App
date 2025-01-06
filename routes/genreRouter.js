const { Router }=require('express');
const genreRouter=Router();

const genreController=require('../controllers/genreController');

genreRouter.get("/add",genreController.getAddGenrePage);
genreRouter.post("/add",genreController.addGenre);

genreRouter.post("/delete/:id",genreController.deleteGenre);

genreRouter.get("/",genreController.getGenres);

module.exports=genreRouter;