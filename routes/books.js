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
  renderFormPage(res, new Book(), "new");
});

router.post("/", async (req, res) => {
  let book;
  try {
    book = new Book({
      title: req.body.title,
      author: req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      description: req.body.description,
    });
    book = await book.populate("author").execPopulate();
    saveCover(book, req.body.cover);
    await book.save();
    res.redirect("/books");
  } catch (error) {
    renderFormPage(res, book, "new", true);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("show-book", {
      book: book,
    });
  } catch (error) {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    renderFormPage(res, book, "edit");
  } catch (error) {
    renderFormPage(res, book, "edit", true);
  }
});

router.put("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    saveCover(book, req.body.cover);
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    if (book) {
      return renderFormPage(res, book, "edit", true);
    }
    res.redirect("/");
  }
});

router.delete("/:id",async(req, res) =>{
  let book
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect("/books")
  } catch (error) {
    if(book){
      return res.render("show-book",{
        book:book,
        errorMessage:"Could not remove book"
      })
    }
    res.redirect("/")
  }
})

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      params.errorMessage = "Error creating Books";
      if(form === "edit"){
        params.errorMessage = "Error editing Books"
      }
    }
    res.render(`${form}-book`, params);
  } catch (error) {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if (!coverEncoded) {
    return;
  }
  const cover = JSON.parse(coverEncoded);
  if (cover && imageMineTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
