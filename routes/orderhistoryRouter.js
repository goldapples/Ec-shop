const router = require("express").Router();
const passport = require("passport");
require("../config/passport")
const requireAuth = passport.authenticate("jwt", { session: false });
const OrderhistoryCtr = require("../controllers/orderhistoryCtr");

router.get("/orderhistory", requireAuth, OrderhistoryCtr.getOrderhistory);
router.delete("/order/delete", OrderhistoryCtr.delete)


module.exports = router;