const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatPrivateModel = new Schema({
  recipients: [],
  delete: {
    type: Boolean,
    default: false,
  },
  roomId: {
    type: String,
  },
  messages: [
    {
      userId: { type: String },
      chatMsg: { type: String },
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
