const router = require("express").Router();

const ChatCtrl = require("../controllers/chatCtrl");

router
  .get("/chat/group", ChatCtrl.group)
  .post("/chat/all", ChatCtrl.all)
  .post("/chat/private", ChatCtrl.private);

module.exports = router;
