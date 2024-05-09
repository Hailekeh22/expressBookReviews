const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.includes(username);
};

const authenticatedUser = (username, password) => {
  return users.includes(username) && users[username].password === password;
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
  req.session.token = token;
  res.json({ message: "Login successful", token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = [];
  }

  books[isbn].reviews.push(review);
  res.json({ message: "Review added successfully", book: books[isbn] });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
