'use strict';
require("dotenv").config();
const express = require("express");
const { request, response } = require("express");
const cors = require("cors");
const superagent = require("superagent");
const { compile } = require("ejs");
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
// app.set('views', './views/pages');
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    // res.status(200).send('home page');
    //redirect .. render
    res.render('pages/index');
})

app.get('/searches/new',(req,res)=>{
    // console.log(req.query);
    res.render('pages/searches/new');
})
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
        // console.log(item);
        let bookdata = item.body.items.map(element => {
            return  new Book (element);
            // console.log('data',data)
            // bookArray.push(data)
        });
    //    console.log(item.body);
       res.render('pages/searches/show',{data:bookdata});
   })
   .catch(()=>{
    errorHandler('something went wrong in getting the data',req,res)
})
  }

function Book(element){
    this.image = element.volumeInfo.imageLinks.thumbnail || "https://i.imgur.com/J5LVHEL.jpg"
    this.title=element.volumeInfo.title 
    this.author=element.volumeInfo.authors || "There is no authors"
    this.isbn = (element.volumeInfo.industryIdentifiers && element.volumeInfo.industryIdentifiers[0].type +" " + 
    element.volumeInfo.industryIdentifiers[0].identifier) ||
        "There is no isbn "
    this.description=element.volumeInfo.description || "There is no description"
    this.date=element.volumeInfo.publishedDate || "There is no description"

}
function errorHandler (error, req, res) {
    res.status(500).send(error);
};


app.listen(PORT,() =>{
    console.log(`You are listening for ${PORT}`);
});