const router = require("express").Router();
const passport = require("passport");
require("../config/passport")
const requireAuth = passport.authenticate("jwt", { session: false });
const OrderhistoryCtr = require("../controllers/orderhistoryCtr");

router.get("/orderhistory", OrderhistoryCtr.getOrderhistory);

module.exports = router;