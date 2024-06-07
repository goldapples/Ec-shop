const router = require("express").Router();
const passport = require("passport");
require("../config/passport")
const requireAuth = passport.authenticate("jwt", { session: false });
const ProductInventoryCtr = require("../controllers/productInventoryCtr");

// router.post("/user/register", AuthCtr.register);
router.post("/product", ProductInventoryCtr.create);
router.get("/product", requireAuth, ProductInventoryCtr.getAllSearch);
// router.get("/user/get", requireAuth, AuthCtr.getAll);
// router.delete("/delete/:id", requireAuth, AuthCtr.delete);
// router.put("/update/:id", requireAuth, AuthCtr.update);

module.exports = router;

