const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomChattingSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "guest",
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "guest",
      },
    ],
    messages: [
      {
        date: {
          type: Date,
          default: Date.now(),
        },
        senderId: {
          type: Schema.Types.ObjectId,
          ref: "guest",
        },
        content: String,
        delete: {
          type: Boolean,
          default: false,
        },
      },
    ],
    date: {
      type: Date,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RoomChatting", RoomChattingSchema);
