require('dotenv').config();

const { Client } = require("pg");

const SQL = `
    DROP TABLE IF EXISTS book_genre CASCADE;
    DROP TABLE IF EXISTS books CASCADE;
    DROP TABLE IF EXISTS genres CASCADE;
    DROP TABLE IF EXISTS authors CASCADE;

    CREATE TABLE authors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        bio TEXT
    );

    CREATE TABLE books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        publication_year INT,
        price DECIMAL(10, 2),
        author_id INT REFERENCES authors(id) ON DELETE CASCADE,
        image_url text NOT NULL
    );

    CREATE TABLE genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    );

    CREATE TABLE book_genre (
        book_id INT REFERENCES books(id) ON DELETE CASCADE,
        genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
        PRIMARY KEY (book_id, genre_id)
    );

    INSERT INTO authors (name, bio) VALUES
    ('J.K. Rowling', 'British author, best known for writing the Harry Potter series'),
    ('J.R.R. Tolkien', 'English writer, best known for The Lord of the Rings and The Hobbit'),
    ('George Orwell', 'English novelist and essayist, known for Animal Farm and 1984'),
    ('Agatha Christie', 'English writer of detective novels, especially those featuring Hercule Poirot'),
    ('Mark Twain', 'American writer known for The Adventures of Tom Sawyer and Adventures of Huckleberry Finn');

    INSERT INTO books (title, description, publication_year, price, author_id, image_url) VALUES
    ('Harry Potter and the Sorcerer''s Stone', 'The first book in the Harry Potter series, where a young boy discovers he is a wizard.', 1997, 19.99, 1, '/books/book1.jpg'),
    ('The Lord of the Rings', 'Epic fantasy trilogy that follows the journey of Frodo Baggins to destroy the One Ring.', 1954, 29.99, 2, '/books/book2.jpg'),
    ('1984', 'Dystopian novel about a totalitarian regime that controls every aspect of life.', 1949, 14.99, 3, '/books/book3.png'),
    ('Murder on the Orient Express', 'Detective Hercule Poirot solves a mystery on a luxurious train ride.', 1934, 12.99, 4, '/books/book4.jpg'),
    ('The Adventures of Tom Sawyer', 'The adventures of a young boy growing up along the Mississippi River.', 1876, 9.99, 5, '/books/book5.jpg');

    INSERT INTO genres (name) VALUES
    ('Fantasy'),
    ('Science Fiction'),
    ('Mystery'),
    ('Adventure'),
    ('Dystopian');
    
    INSERT INTO book_genre (book_id, genre_id) VALUES
    (1, 1), 
    (1, 4), 
    (2, 1), 
    (2, 4), 
    (3, 5), 
    (4, 3), 
    (4, 4), 
    (5, 4); 
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();