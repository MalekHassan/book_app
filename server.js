'use strict';
require("dotenv").config();
const express = require("express");
const { request, response } = require("express");
const cors = require("cors");
const superagent = require("superagent");
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({extended : true}));
// app.set('views', './views/pages');
app.set('view engine','ejs');

app.get('/Hello',(req,res)=>{
    // res.status(200).send('home page');
    //redirect .. render
    res.render('pages/index');
})

app.get('/searches/new',(req,res)=>{
    // console.log(req.query);
    res.render('pages/searches/new');
})
 app.get('/bookList',getData)
 function getData(req,res){
     let bookArray=[];
    // console.log(req.query);
     let bookName=req.query.stringType;
     console.log('hi name',bookName)
     let bookType=req.query.searchType;
     console.log('hi type',bookType)
     if (bookType === 'author'){
   let url=`https:www.googleapis.com/books/v1/volumes?q=${bookName}+inauthor`;
   console.log('URL: ',url);
     superagent.get(url).then (item=>{
        console.log(item);
         item.bady.map(element => {
            let data = new Book (element);
            bookArray.push(data)
        });
    //    console.log(item.body);
       res.send(bookArray);
   });
     }else{
        let url=`https:www.googleapis.com/books/v1/volumes?q=${bookName}+intitle`;
        console.log('URL title :  ',url);
          superagent.get(url).then (item=>{
            console.log(item);
            // console.log(item.body);
            item.bady.map(element => {
                let data = new Book (element);
                bookArray.push(data)
            });            
            
     });
     res.send('hi title')
 }
};

function Book(element){
    this.title=element.title,
    this.author=element.author,
    this.descreption=element.descreption
}


app.listen(PORT,() =>{
    console.log(`You are listening for ${PORT}`);
});