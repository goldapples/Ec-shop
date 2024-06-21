const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const orderSchema = new mongoose.Schema(
  {

    user: {
      type: Schema.Types.ObjectId,
      ref: "Guest"
    },
    products: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: "Products"
      },
      quantity: {
        type: Number,
      },
      delete: {
        type: Boolean,
        default: false
      }
    }],
    shipping: [{
      country: {
        type: String
      },
      prefacture: {
        type: String
      },
      city: {
        type: String
      },
      apartment: {
        type: String
      },
      roomNumber: {
        type: Number
      }
    }],
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store"
    },
    wallet: {
      type: String
    },
    permission: {
      type: Number,
      default: 0
    },
    delete: {
      type: Boolean,
      default: false
    }
  },
  modelOption("order")
);

module.exports = mongoose.model("Order", orderSchema);
