const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const fs = require("fs");

const app = express();

const Blog = require("./models/Blog");

var port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.set("view engine", "ejs");

//database connection
mongoose.set("useFindAndModify", false);
mongoose.connect(
  "mongodb+srv://nandita:nandita@cluster0-i9csd.mongodb.net/test?retryWrites=true&w=majority",
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log("Connected to db on " + port);
    app.listen(port, () => console.log("Server Up and running"));
  }
);

//storing the image in the server
var storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  }
});

var upload = multer({
  storage
}).single("file");

//APIs

app.get("/", (req, res) => {
  Blog.find({}, (err, blogs) => {
    res.render("index.ejs", { blogs });
  });
  //res.render("index.ejs");
});

//CREATE ROUTE
app.post("/blogs", upload, (req, res) => {
  const blog = new Blog({
    image: req.file.filename,
    title: req.body.title,
    story: req.body.story
  });

  blog.save((err, doc) => {
    res.redirect("/");
  });
});

//SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
  Blog.findById(req.params.id, (err, blog) => {
    res.render("show.ejs", { blog });
  });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
  Blog.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, story: req.body.story },
    err => {
      if (err) return res.send(500, err);
      res.redirect("/blogs/" + req.params.id);
    }
  );
});

//DELETE ROUTE

app.delete("/blogs/:id", (req, res) => {
  Blog.findById(req.params.id, (err, blog) => {
    const filename = blog.image;
    //console.log(filename);
    Blog.findByIdAndRemove(req.params.id, err => {
      if (err) return res.send(500, err);
      try {
        fs.unlinkSync("public/images/" + filename);
        //file removed
      } catch (err) {
        console.error(err);
      }
      res.redirect("/");
    });
  });
});
