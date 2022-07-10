const passport = require('passport')
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const localStrategy = require('passport-local');
const table = db.table('users')
passport.use(new localStrategy(
    async function(username, password, done) {
      let checkUser = await table.get(username)

       if(checkUser === "0" + null){
        return (
          done(null, false))
       } 
       if(checkUser === "0" + password){
        return done(null, username)
       }

      

      
      
    },

    passport.serializeUser( async function(user, done) {
      
      done(null, user)
    }),

    passport.deserializeUser(async function(user, done) {

      done(null, user);
    })
  ));



  
