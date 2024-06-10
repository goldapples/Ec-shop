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
    gender: {
      type: String,
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
    note: {
      type: String,
    },
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
  },
  modelOption("guest")
);

module.exports = model("Guest", guestSchema);
