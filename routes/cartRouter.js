const router = require("express").Router();
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const cartCtr = require("../controllers/cartCtr");

router.get("/cart/getAll", requireAuth, cartCtr.getAllCarts);
router.get("/cart/deleteACart", requireAuth, cartCtr.deleteACart);
router.post("/cart/addAProduct", requireAuth, cartCtr.addAProduct);
router.post("/cart/addShipping", requireAuth, cartCtr.addShipping);
router.post("/cart/addWallet", requireAuth, cartCtr.addWallet)

module.exports = router;