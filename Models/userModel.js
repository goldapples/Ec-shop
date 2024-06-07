const mongoose = require("mongoose");
const { Schema } = require('mongoose');
const { modelOption } = require("./config");

const userSchema = new mongoose.Schema(
  {

    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
    },
    password: {
      type: String,
      required: true
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
    avartar: [{
      type: String,
      default: "user"
    }],
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store"
    },
    allow: {
      type: Boolean,
      default: true
    },
    delete: {
      type: Boolean,
      default: false
    }
  },
  modelOption("user")
);

module.exports = mongoose.model("User", userSchema);
