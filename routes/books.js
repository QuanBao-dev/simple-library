const express = require("express");
const multer = require("multer");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
const { coverImageBasePath } = require("../models/book");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join("public", coverImageBasePath);
const imageMineTypes = ["images/jpeg", "image/png", "image/gif"];

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, cb) => {
    console.log(file);
    cb(null, imageMineTypes.includes(file.mimetype));
  },
});

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

router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description,
  });
  try {
    const bookSave = await book.save();
    res.redirect("/books");
    // res.redirect(`books/${bookSave.id}`);
  } catch (error) {
    if (book.coverImageName) {
      removeBookCover(book.coverImageName);
    }
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

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) console.error(err);
  });
}

module.exports = router;
