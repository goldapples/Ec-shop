const router = require("express").Router();
const passport = require("passport");
require("../config/passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const ProductsCtr = require("../controllers/productsCtr");

router.post("/products/create", requireAuth, ProductsCtr.create);
router.post("/products/getbyguest", ProductsCtr.getAllByGuest);
router.get("/products/get", requireAuth, ProductsCtr.getAll);
router.get("/products/images", requireAuth, ProductsCtr.images);
router.delete("/products/delete/:id", requireAuth, ProductsCtr.delete);
router.put("/products/update/:id", requireAuth, ProductsCtr.update);
router.get("/products/getAProduct/:id", ProductsCtr.getAProduct)

module.exports = router;
