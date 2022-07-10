const express = require('express');
const app = express();
const passport = require("passport")
const bodyParser = require('body-parser')
const http = require('http');
const server = http.createServer(app);
const session = require('express-session')
const path = require("path");
const { isObject } = require('util');
require('./config/auth');
const { Server } = require('socket.io')
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const io = new Server(server)

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

        res.send('<a href=/logout>Logout</a>')
    } else {
        res.send('<a href=/login>Login Here</a><br /><a href=/signup>Sign Up</a>')
    }
}

const users = db.table('users')

app.get('/', checkLogIn, async(req, res) => {

    
})

app.post('/signup', async(req, res) => {

    if(await users.has(req.body.username) === true){
        res.status(400).send("Sorry, a user with this username already exists")
    } else {
    await users.add(req.body.username, req.body.password)
    res.send("successfully signed up")

    }

})

app.get('/signup', (req, res) => {
    res.sendFile('signup.html', { root: path.join(__dirname, './public')})
})
app.get('/login',  (req, res) => {
    res.sendFile( 'index.html',{ root: path.join(__dirname, './public') });
})

app.post('/login',  passport.authenticate('local', { successRedirect: '/chatroom', failureRedirect:"/" }), (req, res) => {
    res.send(req.user)
    
})

app.get('/worked', (req, res) => {
    res.send("This worked lmao")
})

app.get('/who', (req, res) => {
    res.send({user: req.user})
})

let history = []
io.on('connection', async(socket) => {
    socket.on('chat message', msg => {
      io.emit('chat message', msg);
      db.push('history', msg)
    });
    socket.emit('history', await db.get("history"))

  });


  
app.get('/chatroom', isLoggedIn, (req, res) => {
    res.sendFile('chatroom.html', { root: path.join(__dirname, './public')})
})

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
} )

server.listen(3000, () => {
    console.log("listening")
})
