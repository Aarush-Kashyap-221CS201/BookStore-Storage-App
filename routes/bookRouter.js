const { Router }=require('express');
const bookRouter=Router();

const bookController=require("../controllers/bookController.js");

bookRouter.get("/add",bookController.getAddBookPage);
bookRouter.post("/add",bookController.addBook);

bookRouter.post("/delete/:id",bookController.deleteBook);

bookRouter.get("/:id",bookController.getBookPage)
bookRouter.post("/:id",bookController.addGenre);

bookRouter.get("/",bookController.getBooks);

module.exports=bookRouter;