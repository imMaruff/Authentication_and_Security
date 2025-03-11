//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const encryption = require("mongoose-encryption");


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}))

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email:String,
    password:String
})

const key = "Thisislittlesecretkey";

userSchema.plugin(encryption, { secret:key , encryptedFields: ["password"]});

const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){

    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });

    newUser.save()
    .then(()=>{
        res.render("secrets")
    })
    .catch((error)=>{
        console.log(error);
        
    })
});


app.post("/login",async function (req,res){
    const username = req.body.username;
    const password = req.body.password;    
    try{
        const user = await User.findOne({email:username}); 
        if(!user){
            return res.send("No such user exist!")
        }
        
        if(user.password === password){
            return res.render("secrets");
        }
        res.send("Invalid password");
            
    }
    catch(error){
        res.send(error)
    }
});




app.listen(3000,function(){
    console.log("listening on port 3000 ");
    
})