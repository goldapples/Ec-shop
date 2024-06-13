const router = require("express").Router();

const ChatCtrl = require("../controllers/chatCtrl");

router
  .post("/chat/all", ChatCtrl.all)
  .post("/chat/private", ChatCtrl.private)

module.exports = router;