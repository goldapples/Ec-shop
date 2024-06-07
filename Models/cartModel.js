
const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const cartSchema = new Schema(
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
        type: Number
      },
      delete: {
        type: Boolean,
        default: false
      }
    }],
    delete: {
      type: Boolean,
      default: false
    }
  },
  modelOption("Cart")
);

module.exports = model("Cart", cartSchema);
