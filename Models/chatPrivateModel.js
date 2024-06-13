const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatPrivateModel = new Schema({
  roomId: { type: String },
  msg: [
    {
      userId: { type: String },
      receiceUserId: { type: String },
      chatMsg: { type: String },
      private: { type: String },
      sentTime: { type: String },
      sendDate: { type: String },
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("ChatPrivate", ChatPrivateModel);
