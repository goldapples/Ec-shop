const router = require("express").Router();
const passport = require("passport");
require("../config/passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const productInventoryCtr = require("../controllers/productInventoryCtr");

router.get("/productInventory/get", requireAuth, productInventoryCtr.getAll);
router.get("/productInventory/sales", requireAuth, productInventoryCtr.sales);
router.post(
  "/productInventory/create",
  requireAuth,
  productInventoryCtr.create
);

module.exports = router;
