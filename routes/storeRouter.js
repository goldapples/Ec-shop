const router = require("express").Router();
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const storeController = require("../controllers/storeCtr");

router.post("/store/new",requireAuth, storeController.createStore);
router.get("/store/storelist",requireAuth, storeController.getAllStores);
router.put("/store/:id", requireAuth,storeController.editStore);
router.delete("/store/:id",requireAuth, storeController.deleteStore);
router.get("/store/:id",requireAuth, storeController.getAStore);
router.delete("/store/multidelete",requireAuth, storeController.multiDeleteStore)

module.exports = router;
