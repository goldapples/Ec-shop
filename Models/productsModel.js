const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const productsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
    tags: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    cnt: {
      type: Number,
    },
    priceoff: {
      type: Number,
      default: 0,
    },
    files: [
      {
        type: String,
        default: "product",
      },
    ],
    delete: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    review: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "Guest",
        },
        rate: {
          type: Number,
        },
        comment: {
          type: String,
        },
        delete: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        }
      },
    ],
  },
  modelOption("products")
);

module.exports = mongoose.model("Products", productsSchema);
