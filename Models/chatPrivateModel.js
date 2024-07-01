const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
require('./guestModel')
const ChatPrivateModel = new Schema(
  {
    content: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: "Guest" },
    receiver: { type: Schema.Types.ObjectId, ref: "Guest" },
    delete: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
    },
  },
  modelOption("chatprivates")
);

module.exports = model("ChatPrivate", ChatPrivateModel);
