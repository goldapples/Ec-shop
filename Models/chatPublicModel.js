const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatPublicModel = new Schema({
  userId: {
    type: String,
    required: true,
  },
  chatMsg: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
  },
  private: {
    type: Boolean,
  },
  sentTime: {
    type: String,
  },
  sendDate: {
    type: String,
  },
  delete: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("ChatPublic", ChatPublicModel);
