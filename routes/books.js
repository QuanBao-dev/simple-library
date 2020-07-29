const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
const imageMineTypes = ["image/jpeg", "image/png", "image/gif"];

router.get("/", async (req, res) => {
  const { title, publishedAfter, publishedBefore } = req.query;
  let filter = {};
  if (title) {
    filter = {
      title: new RegExp(title, "i"),
    };
  }
  if (publishedBefore) {
    filter = {
      publishDate: { ...filter.publishDate, $lte: publishedBefore },
    };
  }
  if (publishedAfter) {
    filter = {
      publishDate: { ...filter.publishDate, $gte: publishedAfter },
    };
  }
  try {
    const books = await Book.find(filter);
    res.render("all-books", {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover)
  try {
    await book.save();
    res.redirect("/books");
    // res.redirect(`books/${bookSave.id}`);
  } catch (error) {
    console.error(error);
    renderNewPage(res, new Book(), true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) params.errorMessage = "Error creating Books";
    res.render("new-book", params);
  } catch (error) {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded){
  if(!coverEncoded){
    return
  }
  const cover = JSON.parse(coverEncoded);
  if(cover && imageMineTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data,"base64");
    book.coverImageType = cover.type
  }
}

module.exports = router;
