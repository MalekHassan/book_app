'use strict';
require("dotenv").config();
const express = require("express");
const { request, response } = require("express");
const cors = require("cors");
const superagent = require("superagent");
const { compile } = require("ejs");
const PORT = process.env.PORT || 8080;
const app = express();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);


app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
// app.set('views', './views/pages');
app.set('view engine','ejs');

app.get('/', bookSet);


async function bookSet(req,res){
    let dataBase = await getBookData()
    res.render('pages/index', { banana:dataBase});
}
function getBookData(){
    let SQL = `SELECT * FROM books`;
   return client.query(SQL)
    .then(results =>{
    return results.rows;
    })
    .catch (error => errorHandler(error,req,res))
}

app.get('/searches/new',(req,res)=>{
    // console.log(req.query);
    res.render('pages/searches/new');
})
let bookarr=[]
 app.post('/searches/show',getData)
  function getData(req,res){
    //  let bookArray=[];
    // console.log(req.query);
     let bookName=req.body.stringType;
     console.log('hi name',bookName)
     let bookType=req.body.searchType;
     console.log('hi type',bookType)
    //  let check = checking(bookName,bookType)
     if (bookType === 'author'){
   var url=`https://www.googleapis.com/books/v1/volumes?q=+inauthor:${bookName}`
}else{
    var url=`https://www.googleapis.com/books/v1/volumes?q=+intitle:${bookName}`}
//    console.log('URL: ',url);
//    console.log('superagent', await superagent.get(url));
     superagent.get(url).then (item=>{
        // console.log(item.body.);
        // let counter = 0;
        let bookdata = item.body.items.map(element => {
            //  counter++;
             let bookobj = new Book (element);
bookarr.push(bookobj);
return bookobj;
            // console.log('data',data)
            // bookArray.push(data)
            
        });
              

        // saveToDataBase(bookdata);
    //    console.log(item.body);
       res.render('pages/searches/show',{data:bookdata});
   })
   .catch(()=>{
    errorHandler('something went wrong in getting the data',req,res)
})
}

app.post('/books', addBook); // adds a book into all
function addBook(req, res) {
  let SQL = `INSERT INTO selectedBooks (title, author, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
  let values = [req.body.title, req.body.author, req.body.isbn, req.body.image_url, req.body.description];
  
  client.query(SQL, values)
    .then(result => {
      res.redirect(`/books/${result.rows[0].id}`);
  });
}
// app.post('/savedbooks',saveRout);
//  function saveRout(req,res){
//   let SQL = `SELECT * FROM books WHERE id=$1`;
//   // console.log(req.params);
//   let book_id = req.params.id;
//   let values = [book_id];
//   client.query(SQL,values)
//   .then(results=>{
//     // console.log(results.rows);
//     res.render('pages/books/details',{detailedBook: results.rows[0]});  
//   })
// }
app.post('/showadd',saveToDataBase)
function saveToDataBase(req , res){
    let {image_url , title, author, isbn , description} = req.body
      let SQL = `INSERT INTO books ( image_url , title, author, isbn , description) VALUES ($1,$2,$3,$4,$5);`;
        let safeValue = [ image_url , title, author, isbn , description];
        client.query(SQL,safeValue).then(()=>{
          console.log('we are in data base',req.body)
          res.redirect('/')
        })
      
     
  }
  app.get('/books/:id',viewDetailsBook);
  function viewDetailsBook(req,res) {
    let SQL = `SELECT * FROM books WHERE id=$1`;
    // console.log(req.params);
    let book_id = req.params.id;
    let values = [book_id];
    // saveToDataBase(SQL.rows[0]);
    client.query(SQL,values)
    .then(results=>{
      // console.log(results.rows); 
      res.render('pages/books/details',{detailedBook: results.rows[0]}); 
    })
  }
function Book(element){
    this.image_url = element.volumeInfo.imageLinks.thumbnail || "https://i.imgur.com/J5LVHEL.jpg"
    this.title=element.volumeInfo.title 
    this.author=element.volumeInfo.authors || "There is no authors"
    this.isbn = (element.volumeInfo.industryIdentifiers && element.volumeInfo.industryIdentifiers[0].type +" " + 
    element.volumeInfo.industryIdentifiers[0].identifier) ||
        "There is no isbn "
    this.description=element.volumeInfo.description || "There is no description"
    // this.date=element.volumeInfo.publishedDate || "There is no description"

}
function errorHandler (error, req, res) {
    res.status(500).send(error);
};

client.connect(()=>{

app.listen(PORT,() =>{
    console.log(`You are listening for ${PORT}`);
});
});
