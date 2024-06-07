const router = require("express").Router();
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const roleController = require("../controllers/roleCtr");

router.post("/role/new", requireAuth, roleController.createRole);
router.get("/role/rolelist", requireAuth, roleController.getAllRole);
router.put("/role/:id", requireAuth, roleController.editRole);
router.delete("/role/:id", requireAuth, roleController.deleteRole);
router.get("/role/:id", requireAuth, roleController.getARole);
router.delete("/role/delete/:id", requireAuth, roleController.deleteRole);
module.exports = router;