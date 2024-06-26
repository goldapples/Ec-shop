const router = require("express").Router();
const passport = require("passport");
require("../config/passport")
const requireAuth = passport.authenticate("jwt", { session: false });
const OrderCtr = require("../controllers/orderCtr");

router.get("/order/getAll", requireAuth, OrderCtr.getAll);
router.post("/order/setState/:id", OrderCtr.setState);

module.exports = router;