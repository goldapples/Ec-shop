const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    description: {
      type: String
    },
    delete: {
      type: Boolean,
      default: false
    }
  },
  modelOption("category")
);

module.exports = mongoose.model("Category", categorySchema);
