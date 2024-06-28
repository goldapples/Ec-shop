const passport = require("passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const router = require("express").Router();

const ChatCtrl = require("../controllers/chatCtrl");

router
  .post("/chat/groupList", ChatCtrl.group)
  .post("/chat/group", ChatCtrl.groupChat)
  .post("/chat/all", ChatCtrl.all)
  .post("/chat/private", ChatCtrl.private)
  .get("/chat/getAllUsers", requireAuth, ChatCtrl.getAllUsers)
  .get("/chat/getAllConUsers",requireAuth, ChatCtrl.getAllConUsers)

module.exports = router;
