const express = require('express')
const app = express()
const cors=require('cors')
const ObjectId=require('mongodb').ObjectId;
const fileUpload=require('express-fileupload')
const bodyParser = require('body-parser')
const fs=require('fs-extra')
const path = require('path')
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ynfam.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('orders'));
app.use(fileUpload());
const port=5000
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
    const  orderCollection = client.db("creativeAgencyData").collection("order");
    const  reviewCollection = client.db("creativeAgencyData").collection("review");
    const adminCollection = client.db("creativeAgencyData").collection("admin")
    const serviceCollection=client.db("creativeAgencyData").collection("service")
    
    app.post('/addOrder',(req,res)=>{
    const file=req.files.file;
    const name=req.body.name;
    const email=req.body.email;
    const price=req.body.price;
    const category=req.body.category;
    const status=req.body.status;
    const desc=req.body.desc;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };
    orderCollection.insertOne({ name, desc, status,category,price, email, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })
    app.get('/servicelist',(req,res)=>{
      console.log(req.query.email)
        orderCollection.find({email:req.query.email})
        .toArray((err,documents)=>{
            console.log(documents)
          res.send(documents)
         })
      })
      app.post('/review',(req,res) => {
        const reviewData=req.body;
        reviewCollection.insertOne(reviewData)
       .then(result=>{
           console.log(result)
        res.send(result.insertedCount>0)
       })
    })
    app.get('/getreview',(req,res)=>{
        reviewCollection.find({})
        .toArray((err,documents)=>{
           res.send(documents)
         })
      })
      app.get('/getallservice',(req,res)=>{
        orderCollection.find({})
        .toArray((err,documents)=>{
           res.send(documents)
         })
      })
    app.post('/makeAdmin',(req,res) => {
        const adminEmail=req.body;
       adminCollection.insertOne(adminEmail)
       .then(result=>{
            console.log(result)
          res.send(result.insertedCount>0)
       })
    })
    app.get('/admin',(req,res)=>{
        adminCollection.find({email:req.query.email})
        .toArray((err,documents)=>{
             res.send(documents)
        })
      })
      app.get('/getservice',(req,res)=>{
       serviceCollection.find({})
        .toArray((err,documents)=>{
             res.send(documents)
        })
      })
      app.post('/addservice',(req,res)=>{
        const file=req.files.file;
        const title=req.body.title;
        const desc=req.body.desc;

        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        serviceCollection.insertOne({ desc,image,title })
            .then(result => {
              console.log(result.insertedCount)
                res.send(result.insertedCount > 0);
            })
        })
      app.patch('/update/:id',(req,res)=>{  
        console.log(req.body.option)      
          orderCollection.updateOne({_id:ObjectId(req.params.id)},
          {
            $set:{status:req.body.option}
          })
          .then(result=>{
            console.log(result.modifiedCount)
            res.send(result. modifiedCount>0);
          })
        })
});
app.get('/', (req, res) => {
  res.send('database is working')
})
app.listen(process.env.PORT||port)