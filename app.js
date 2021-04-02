//jshint esversion:6

require("dotenv").config(); // This is used to top into .env file to extract informations(Strings or Numbers) that we don't want to be displayed in the code directly.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const userSchema = new mongoose.Schema({ //This 'userSchema' Object is created using 'Schema()' Constructor function so that we can run some methods on it.
  email: String,
  password: String
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});   // .plugin() method is used to add additional features to the schema. It only works if the schema is built using 'Schema()' constructor function.
// "mongoose-encryption", works in a way that it will automatically encrypt the document when we '.save()' it will decrypt the document when we '.findOne()' it.                                                                          // using 'encryptedFields:' property we can specify which property of the document we want to encrypt. In this case we only want to encrypt 'password'.
const User = mongoose.model("User", userSchema);



app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) { // .save() will encrypt the password.
    if(err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser) { // .findOne() will decrypt the password.
    if (err) {
      console.log(err);
    } else {
      if(foundUser) {
        if(foundUser.password === password) {
          res.render("secrets");
        } else {
          res.send("Wrong username or password!");
        }
      }
    }
  });
});












app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
