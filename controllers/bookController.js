const { body, validationResult } = require("express-validator");
const multer = require('multer');
const pool=require('../db');
const path=require('path');

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/books'); // Directory where files will be saved
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Generate a unique filename
    }
});

const upload = multer({ storage: storage });

async function getBooks(req,res) {
    const { author, genre, price_sort } = req.query;

    let query = `
        SELECT books.*,authors.name AS author_name,ARRAY_AGG(genres.id) AS genres
        FROM books
        JOIN authors ON books.author_id = authors.id
        LEFT JOIN book_genre ON books.id = book_genre.book_id
        LEFT JOIN genres ON genres.id = book_genre.genre_id
    `;

    let authorArray=[];
    let genreArray=[];

    const conditions = [];
    const values = [];

    // Filter by authors
    if (author) {
        const authors = Array.isArray(author) ? author : [author];
        authorArray=await pool.query('select name from authors where id=ANY($1)',[authors]);
        conditions.push(`books.author_id = ANY($${values.length + 1})`);
        values.push(authors);
    }

    // Filter by genres
    if (genre) {
        const genres = Array.isArray(genre) ? genre : [genre];
        genreArray=await pool.query('select name from genres where id=ANY($1)',[genres]);
        conditions.push(`book_genre.genre_id = ANY($${values.length + 1})`);
        values.push(genres);
    }

    // Add conditions to query
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query+= 'GROUP BY books.id, authors.name';

    // Sorting
    if (price_sort === 'asc') {
        query += ` ORDER BY books.price ASC`;
    } else if (price_sort === 'desc') {
        query += ` ORDER BY books.price DESC`;
    } else {
        query += ` ORDER BY books.id ASC`;
    }
    
    try {
        const books = await pool.query(query, values);
        const authors = await pool.query('SELECT * FROM authors');
        const genres = await pool.query('SELECT * FROM genres');
        res.render('book', {
            books: books.rows,
            authors: authors.rows,
            genres: genres.rows,
            filter: req.query.filter,
            authorFilter : authorArray.rows,
            genreFilter : genreArray.rows,
            priceFilter : price_sort,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

async function getBookPage(req,res){
    try {
        const books=await pool.query(`select books.*,authors.name from books join authors on books.author_id=authors.id and books.id=${req.params.id}`);
        const genres=await pool.query(`SELECT genres.name FROM books JOIN book_genre ON books.id = book_genre.book_id and books.id = ${req.params.id} JOIN genres ON genres.id = book_genre.
genre_id;`);
        const all_genres=await pool.query('select name from genres');
        res.render('bookPage',{book:books.rows[0],genres:genres.rows,click:req.query.click,all_genres:all_genres.rows,deleteClick:req.query.delete});
    } 
    catch {
        res.send("ERROR FETCHING DATA....");
    }
}

async function addGenre(req,res) {
    try {
        const id = req.params.id;
        await pool.query(`DELETE FROM book_genre WHERE book_id = $1`, [id]);
        const all_genres = await pool.query('SELECT * FROM genres');
        for (const genre of all_genres.rows) {
            const name = genre.name;
            if (!req.body[name]) continue; 
            await pool.query('INSERT INTO book_genre (book_id, genre_id) VALUES ($1, $2)', [id, genre.id]);
        }
        res.redirect(`/books/${id}`);
    } catch {
        res.redirect("/");
    }
}

async function getAddBookPage(req,res) {
    const authors=await pool.query('select * from authors');
    res.render('addBook',{errors:[],authors:authors.rows});
}

const digitErr = "must only contain numbers.";

const validateUser = [
    body("year").trim()
        .isNumeric().withMessage(`Publication Year ${digitErr}`),
    body("price").trim()
        .isNumeric().withMessage(`Book Price ${digitErr}`),
];


const addBook=[
    upload.single('image'),
    validateUser,
    async function addBook(req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const authors=await pool.query('select * from authors');
            return res.status(400).render('addBook', { errors: errors.array(),authors:authors.rows});
        }
        try {
            const { title, author, year, price, description } = req.body;
            const image_url=`/books/${req.file.filename}`;
            await pool.query('INSERT INTO books(title,description,publication_year,price,author_id,image_url) VALUES ($1,$2,$3,$4,$5,$6)',[title,description,year,price,author,image_url]);
            const newBook=await pool.query('SELECT id FROM books where image_url=$1',[image_url]);
            res.redirect(`/books/${newBook.rows[0].id}`);
        } 
        catch{
            console.log("yo");
            res.redirect("/");    
        }
    }
]

async function deleteBook(req,res) {
    const id=req.params.id;
    const password=req.body.password;
    if (password!=process.env.PASSWORD) return res.redirect(`/books/${id}`);
    await pool.query('delete from books where id=$1',[id]);
    await pool.query('delete from book_genre where book_id=$1',[id]);
    res.redirect("/books");
}

module.exports={getBooks,getBookPage,addGenre,getAddBookPage,addBook,deleteBook};