DROP TABLE IF EXISTS mybooks;

CREATE TABLE mybooks (
    id serial PRIMARY KEY,
    imageLinks VARCHAR(255) ,
    title VARCHAR(255) ,
    authors VARCHAR(255) ,
    description VARCHAR(2555) 
);
