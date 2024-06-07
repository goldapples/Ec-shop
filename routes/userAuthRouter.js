const router = require("express").Router();
const passport = require("passport");
require("../config/passport")
const requireAuth = passport.authenticate("jwt", { session: false });
const AuthCtr = require("../controllers/authCtr");


router.post("/user/register", AuthCtr.register);
router.post("/user/login", AuthCtr.login);
router.get("/user/tokenlogin", requireAuth, AuthCtr.tokenlogin);
router.get("/user/userlist", requireAuth, AuthCtr.getAll);
router.delete("/delete/:id", requireAuth, AuthCtr.delete);
router.put("/user/update", requireAuth, AuthCtr.update);
router.put("/user/updateput", requireAuth, AuthCtr.updateput);
router.put("/user/allow", requireAuth, AuthCtr.allowCtrl);

module.exports = router;