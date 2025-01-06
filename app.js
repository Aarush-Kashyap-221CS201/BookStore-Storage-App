require("dotenv").config();

const express=require('express');
app=express();

app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

const homeRouter=require('./routes/homeRouter');
app.use("/",homeRouter);

const bookRouter=require('./routes/bookRouter');
app.use("/books",bookRouter);

const authorRouter=require('./routes/authorRouter');
app.use("/authors",authorRouter);

const genreRouter=require('./routes/genreRouter');
app.use("/genres",genreRouter);

const port=process.env.PORT;
app.listen(port,()=>{
    console.log("Server started...");
})
