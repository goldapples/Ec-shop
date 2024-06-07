const router = require("express").Router();
const chattingControll = require("../controllers/chattingCtr");

router.get("/getAllChatMsgs", chattingControll.getAllChatMsgs);
module.exports = router;
