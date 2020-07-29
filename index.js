require("dotenv").config();
const express = require("express");
const app = express();
const port = 8080;
app.set("views", "./views");
app.set("view engine", "pug");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology:true,
  useNewUrlParser:true
},() => {
  console.log("connected to db")
});

const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors")
const bookRouter = require("./routes/books")

app.use(methodOverride("_method"))
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books",bookRouter);

app.listen(port, () => console.log(`Example app listening on port ${port} !`));
