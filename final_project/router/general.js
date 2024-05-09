const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const fetchBooks = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return Object.values(books);
};

public_users.get("/", async function (req, res) {
  try {
    const allBooks = await fetchBooks();
    res.json({ books: allBooks });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });

  const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
  return res
    .status(201)
    .json({ message: "User registered successfully", token });
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json({ book });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const authorBooks = Object.values(books).filter(
    (book) => book.author === author
  );
  if (authorBooks.length > 0) {
    res.json({ books: authorBooks });
  } else {
    res.status(404).json({ message: "Books by author not found" });
  }
});

public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.toLowerCase();
  const titleBooks = Object.values(books).filter((book) =>
    book.title.toLowerCase().includes(title)
  );
  if (titleBooks.length > 0) {
    res.json({ books: titleBooks });
  } else {
    res.status(404).json({ message: "Books with title not found" });
  }
});

public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews && book.reviews.length > 0) {
    res.json({ reviews: book.reviews });
  } else {
    res.status(404).json({ message: "Book reviews not found" });
  }
});

module.exports.general = public_users;
