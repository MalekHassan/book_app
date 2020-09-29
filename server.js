'use strict'

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const dotenv = require('dotenv');
const cors = require('cors');
const methodOverride = require('method-override');
const ejs = require('ejs');
const superagent = require('superagent');
const pg = require('pg');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);

//Routs:
app.get('/',homepage);
app.post('/searches',fromForm)
app.post('/favorite',addTofav)
app.get('/favorite',renderFav)
app.get('/details/:id',getDetails)
app.put('/details/:id',updating)
app.delete('/deletes/:id',deleting)



//Functions:
function homepage(req,res){
    res.render('index')
}
let booksArray=[]
function fromForm(req,res){
    
    const {enter,by} =req.body;
    var url=`https://www.googleapis.com/books/v1/volumes?q=+${by}:${enter}`
    superagent.get(url).then(result=>{
        // console.log('result',result.body.items);
        result.body.items.forEach(element=>{
            booksArray.push(new Books (element))
        //  console.log('element',element);
        })
        res.render('new',{data:booksArray})
    })

}

function addTofav(req,res){
    let sql = `INSERT INTO mybooks (imageLinks, title, authors, description) VALUES($1,$2,$3,$4);`
    let value = [req.body.imageLinks, req.body.title, req.body.authors, req.body.description]
    client.query(sql,value).then(()=>{
        res.redirect('/favorite')
    })

}

function renderFav(req,res){
    let sql = `select * from mybooks`
    client.query(sql).then(result=>{
        res.render('fav',{data:result.rows})
    })
}

function getDetails(req,res){
    let sql = `select * from mybooks where id=$1`
    let value = [req.params.id]
    client.query(sql,value).then(result=>{
        res.render('detailPage',{data:result.rows[0]})
    })
}

function updating(req,res){
    let sql = `UPDATE mybooks SET imageLinks=$1, title=$2, authors=$3, description=$4 WHERE id=$5;`
    let value = [req.body.imageLinks, req.body.title, req.body.authors, req.body.description , req.params.id]
    client.query(sql,value).then(()=>{
        res.redirect(`/details/${req.params.id}`)
    })

}

function deleting(req,res){
    console.log('delete');
    let sql = `delete from mybooks where id=$1`
    let value = [req.params.id]
    client.query(sql,value).then(()=>{
        console.log('sql');
        res.redirect('/favorite')
    })
}

// constructors:
function Books(data){
    this.imageLinks = data.volumeInfo.imageLinks.thumbnail
    this.title = data.volumeInfo.title
    this.authors = data.volumeInfo.authors[0]
    this.description = data.volumeInfo.description    
}


client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`you're listening to port: ${PORT}`);
    })
})
