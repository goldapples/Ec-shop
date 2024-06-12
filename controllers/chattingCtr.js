const ChatUser = require("../Models/chattingModel");

exports.getAllChatMsgs = async (req, res) => {
  ChatUser.find().then((user) => {
    if (!user) {
      return res.status(404).json({ message: "There is no User!" });
    }
    res.status(200).json({
      user: msg.filter((item) => {
        item.private == false;
      }),
    });
  });
};
