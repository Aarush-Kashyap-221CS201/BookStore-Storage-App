const pool=require('../db');

async function getGenres(req,res) {
    const genres=await pool.query('select * from genres');
    res.render('genre',{genres:genres.rows,deleteClick:req.query.delete,deletedGenre:req.query.id});
}

async function deleteGenre(req,res) {
    const password=req.body.password;
    if (password!=process.env.PASSWORD) return res.redirect("/genres");
    const id=req.params.id;
    await pool.query('delete from book_genre where genre_id=$1',[id]);
    await pool.query('delete from genres where id=$1',[id]);
    res.redirect("/genres");
}

async function getAddGenrePage(req,res) {
    const books=await pool.query('select * from books');
    res.render('addGenre',{books:books.rows,errors:[]});
}

async function addGenre(req,res) {
    const sameGenres=await pool.query('select * from genres where name=$1',[req.body.name]);
    if (sameGenres.rows.length>0){ 
        let error=[{ msg: "Genre already exists. "}];
        const books=await pool.query('select * from books');
        return res.render('addGenre',{errors:error,books:books.rows});
    }
    await pool.query('insert into genres(name) values($1)',[req.body.name]);
    const insertedGenre=await pool.query('select * from genres where name=$1',[req.body.name]);
    const genreId=insertedGenre.rows[0].id;
    for (const [key, value] of Object.entries(req.body)) {
        if (key=="name") continue;
        await pool.query('insert into book_genre values($1,$2)',[key,genreId]);
    }
    res.redirect("/genres/add");
}

module.exports={getGenres,deleteGenre,getAddGenrePage,addGenre};