const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  msg: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
  },
  private: {
    type: Boolean,
  },
  unreadNum: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Chatting", ChatSchema);
