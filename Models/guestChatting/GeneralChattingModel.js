const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GeneralChattingSchema = new Schema({
  
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "guest",
  },
  content: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  delete:{
    type:Boolean,
    default:false
  }
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("GeneralChatting", GeneralChattingSchema);
