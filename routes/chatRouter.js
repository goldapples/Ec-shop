const router = require("express").Router();

const ChatCtrl = require("../controllers/chatCtrl");

router
  .post("/chat/groupList", ChatCtrl.group)
  .post("/chat/group", ChatCtrl.groupChat)
  .post("/chat/all", ChatCtrl.all)
  .post("/chat/private", ChatCtrl.private);

module.exports = router;
