const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const orderSchema = new mongoose.Schema(
  {

    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Products"
    },
    quantity: {
      type: Number
    },
    permission: {
      type: Boolean,
      default: false
    },
    delete: {
      type: Boolean,
      default: false
    }
  },
  modelOption("order")
);

module.exports = mongoose.model("Order", orderSchema);
