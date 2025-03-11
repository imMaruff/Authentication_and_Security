//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// const encryption = require("mongoose-encryption");
// const md5 = require("md5");


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
    secret: 'This is our secret key',
    resave: false,
    saveUninitialized: true
  }));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email:String,
    password:String
})

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encryption, { secret:process.env.SECRET , encryptedFields: ["password"]});

const User = new mongoose.model("User",userSchema);


passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
}); 
app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.render("login")
    }
});

app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/")
        }
    })
})
app.post("/register",function(req,res){
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email:req.body.username,
    //         password:hash
    //     });
    //     newUser.save()
    //     .then(()=>{
    //         res.render("secrets")
    //     })
    //     .catch((error)=>{
    //         console.log(error);
    //     })
    // });
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("secrets");
            })
        }
    })


});


app.post("/login",async function (req,res){

    const user = new User({
        username : req.body.username,
        password : req.body.password    
    })
    req.login(user,function(err){
        if(err){
            console.log(err);
            res.redirect("login")
            
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("secrets");
            })
        }
    })
    // try{
    //     const user = await User.findOne({email:username}); 
    //     if(!user){
    //         return res.send("No such user exist!")
    //     }
    //     bcrypt.compare(password, user.password, function(err, result) {
    //         if(result === true){
    //             res.render("secrets");
    //         }
    //         else{

    //             res.send("Invalid password");
    //         }
    //     }); 
    // }
    // catch(error){
    //     res.send(error)
    // }

});




app.listen(3000,function(){
    console.log("listening on port 3000 ");
    
})