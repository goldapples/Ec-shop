const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");

const guestSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    birthday: {
      type: Date,
    },
    avartar: [
      {
        type: String,
        default: "user",
      },
    ],
    shipping: {
        country: String,
        prefecture: String,
        city: String,
        apartment: String,
        roomNumber: Number
    },
    guest: {
      type: Boolean,
      default: true
    },
    delete: {
      type: Boolean,
      default: false,
    },
    favourite: [{
      type: Schema.Types.ObjectId,
      ref: "Product",
    }],
  },
  modelOption("guest")
);

module.exports = model("Guest", guestSchema);
