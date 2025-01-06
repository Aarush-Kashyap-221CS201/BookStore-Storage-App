const pool=require('../db');

async function getAuthors(req,res) {
    const authors=await pool.query('select authors.*,COALESCE(COUNT(books.id), 0) as count from authors left join books on authors.id = books.author_id group by authors.id order by authors.id asc');
    res.render('author',{authors:authors.rows,deleteClick:req.query.delete,deletedAuthor:req.query.id});
}

async function getAuthorPage(req,res) {
    const id=req.params.id;
    const author=await pool.query('select * from authors where id=$1',[id]);
    const books=await pool.query('select * from books where author_id=$1',[id]);
    res.render('authorPage',{author:author.rows[0],books:books.rows});
}

async function deleteAuthor(req,res) {
    const password=req.body.password;
    if (password!=process.env.PASSWORD) return res.redirect("/authors");
    const id=req.params.id;
    await pool.query('delete from book_genre where book_id in (select books.id from books join authors on books.author_id=authors.id and authors.id=$1)',[id]);
    await pool.query('delete from books where author_id=$1',[id]);
    await pool.query('delete from authors where id=$1',[id]);
    res.redirect("/authors");
}

async function getAddAuthorPage(req,res) {
    res.render('addAuthor',{errors:[]});
}

async function addAuthor(req,res) {
    const {name,bio}=req.body;
    await pool.query('insert into authors(name,bio) values ($1,$2)',[name,bio]);
    res.redirect("/authors");
}

module.exports={getAuthors,getAuthorPage,deleteAuthor,getAddAuthorPage,addAuthor};