const router = require("express").Router();
const passport = require("passport");
require("../config/passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const showpopularCtr = require("../controllers/showpopularCtr");

// router.post("/products/create", requireAuth, showpopularCtr.create);
router.get("/showpopular/get", requireAuth, showpopularCtr.getAll);
router.get("/bestUser", showpopularCtr.bestUser);
// router.get("/products/images", requireAuth, ProductsCtr.images);
// router.delete("/products/delete/:id", requireAuth, ProductsCtr.delete);
// router.put("/products/update/:id", requireAuth, ProductsCtr.update);

module.exports = router;
