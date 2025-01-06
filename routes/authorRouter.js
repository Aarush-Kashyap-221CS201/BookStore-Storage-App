const { Router }=require('express');
const authorRouter=Router();

const authorController = require('../controllers/authorController');

authorRouter.get("/add",authorController.getAddAuthorPage);
authorRouter.post("/add",authorController.addAuthor);

authorRouter.post("/delete/:id",authorController.deleteAuthor);

authorRouter.get("/:id",authorController.getAuthorPage);

authorRouter.get("/",authorController.getAuthors);

module.exports=authorRouter;