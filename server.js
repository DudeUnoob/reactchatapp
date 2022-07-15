const express = require('express');
const app = express();
const passport = require("passport")
const bodyParser = require('body-parser')
const http = require('http');
require("dotenv").config();
const jwtAuth = require('./config/jwtauth');
const server = http.createServer(app);
const session = require('express-session')
const path = require("path");
const { isObject } = require('util');
const fs = require('fs')
require('./config/auth');
const { Server } = require('socket.io')
const { QuickDB } = require('quick.db');
const jwt = require("jsonwebtoken");
const db = new QuickDB();
const io = new Server(server);
const axios = require('axios');
const { createPrivateKey } = require('crypto');

express.static(path.join(__dirname, '/public'));
app.use(bodyParser.json())
app.use(session({
    secret: "helloworld",
    resave: false,
    saveUninitialized: false
  }))
  app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())

app.use(passport.session())


function isLoggedIn (req, res, next) {
    req.user ? next() : res.sendStatus(400)
}


function checkLogIn(req, res, next) {
    if(req.user){

        return res.send('<a href=/logout>Logout</a>')
    } else {
       return  res.send('<a href=http://localhost:3000/login>Login Here</a><br /><a href=/signup>Sign Up</a>')
    }
}

// function okLogin(req, res, next) {
//     console.log(req.user)
// }

const users = db.table('users')

app.get('/', checkLogIn, async(req, res) => {

    
})


let preUser;
let history = []
io.on('connection', async(socket) => {
    socket.on('chat message', (msg, user) => {
      io.emit('chat message', msg, user);
      console.log(user + ': ' +msg)
      db.push('history', user + ': ' + msg)
    });
    socket.emit('history', await db.get("history"))

  });


  
app.get('/chatroom', jwtAuth, (req, res) => {
    res.sendFile('chatroom.html', { root: path.join(__dirname, './public')})
})

app.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect('/')
} )

app.get('/signup', (req, res) => {
    res.sendFile('signup.html', { root: path.join(__dirname, './public')})
})


app.post('/signup', async(req, res) => {

    if(await users.has(req.body.username) === true){
        res.status(400).send("Sorry, a user with this username already exists")
    } else {
    await users.add(req.body.username, req.body.password)
    res.send("successfully signed up")

    }

})

app.get('/login', async(req, res) => {
    res.sendFile('login.html',{ root: path.join(__dirname, './public') });
})

app.post('/login', async(req, res) => {

   
        let username = req.body.username
        let password = req.body.password
        let checkUser = await users.get(username)

       if(checkUser === "0" + null){
        return res.status(400).send("no log in for user")
       } 
       if(checkUser === "0" + password){
       
        let test = req.body.username

        const token = jwt.sign(
            {user: test},
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
        )
    
        req.session.token = token
        req.session.userid = test
        return res.status(200).send("successfully logged in")
       }
    
   
})


app.get('/who', async(req, res) => {
    res.send({ user: req.session.userid })
})

server.listen(3000, () => {
    console.log("listening")
})
