const express = require("express");
const router = express.Router();
const Author = require("../models/author")

router.get("/", async(req,res) => {
  let searchOptions = {};
  if(req.query.name !== null && req.query.name !== ""){
    searchOptions.name = new RegExp(req.query.name,"i")
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("all-authors",{
      authors:authors,
      searchOptions:req.query
    })
  } catch (error) {
    res.redirect("/");
  }
})

router.get("/new",(req,res) => {
  res.render("new-author",{
    author: new Author({})
  })
})

router.post("/", async(req,res) => {
  console.log(req.body.name);
  const author = new Author({
    name:req.body.name,
  })
  try { 
    await author.save();
    res.redirect(`/authors`);
  } catch (error) {
    res.render("new-author",{
      author:author,
      errorMessage:"Error creating Author"
    })
  }
})

module.exports = router;