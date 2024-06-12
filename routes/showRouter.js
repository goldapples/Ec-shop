const router = require("express").Router();
const passport = require("passport");
require("../config/passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const showCtr = require("../controllers/showCtr");

// router.post("/products/create", requireAuth, showCtr.create);
router.get("/show/get", requireAuth, showCtr.getAll);
// router.get("/products/images", requireAuth, ProductsCtr.images);
// router.delete("/products/delete/:id", requireAuth, ProductsCtr.delete);
// router.put("/products/update/:id", requireAuth, ProductsCtr.update);

module.exports = router;
