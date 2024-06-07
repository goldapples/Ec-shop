const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const storeSchema = new mongoose.Schema(
  {

    title: {
      type: String
    },
    description: {
      type: String
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    delete: {
      type: Boolean,
      default: false
    }
  },
  modelOption("store")
);

module.exports = mongoose.model("Store", storeSchema);
