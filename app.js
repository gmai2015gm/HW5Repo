/**
 * INFINITY MARKETPLACE (HW4) 
 * Programmed by Garrett Mai
 * 
 * Purpose:
 * Interacts with mongoDB to allow for persistent functionality 
 * of the Infinity Marketplace App we've been working on
 * 
 * NOTES:
 * - As perscribed in the assignment, this is not hooked up to the front end of the site. 
 */

//Imports
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const User = require('./models/user')
const userRouter = require('./routers/user')
const productRouter = require('./routers/product')
const session = require('express-session')
const MongoStore = require('connect-mongo')

//Basic server setup
const port = 3000;
app.listen(port)
console.log("Starting server on Port 3000")

/* Express Configuration and Setup */
app.use(express.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname,'public'))) 
app.set('views',path.join(__dirname,'views')) 
app.set('view engine','ejs')
app.use(express.json())



//The mongo hookup
const mongoURL = "mongodb+srv://gmai2015gm:test1234@theclusterforjs.txy49et.mongodb.net/infinity-market?retryWrites=true&w=majority"
mongoose.connect(mongoURL,{ useNewUrlParser: true, useUnifiedTopology: true},(err)=>{
    if(err)
        console.log("Could not connect to database",err)
    else
        console.log("Connected to DB..")
})

app.use(session({
    secret: 'TopSecretKey', //process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoURL
    })
}))

//Run these routers. 
app.use(userRouter)
app.use(productRouter)

// Home Route (Right from template)
app.get('/',(req,res)=>{
   res.render('index',{title:'Home'})
})

/* Basic 404 response*/
app.get('/*',(req,res)=>{
    res.status(404)
    res.type('txt')
    res.write("Oops, this page does not exist")
    res.send()
})




