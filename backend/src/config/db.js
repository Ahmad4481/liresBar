const mongoose = require("mongoose");

module.exports = mongoose
  .connect("mongodb://localhost:27017/lirebar")
  .then(() => {
    try {
      console.log("Connected to MongoDB");
    } catch (err) {
      console.log(err);
    }
  });
