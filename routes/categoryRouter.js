const router = require("express").Router();
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const categoryController = require("../controllers/categoryCtr");

router.post("/category/new", requireAuth, categoryController.createCategory);
router.get("/category/categorylist", requireAuth, categoryController.getAllCategories);
router.put("/category/:id", requireAuth, categoryController.editCategory);
router.delete("/category/:id", requireAuth, categoryController.deleteCategory);
router.get("/category/:id", requireAuth, categoryController.getACategory);
router.delete("/category/mutidelete", requireAuth, categoryController.multiDeleteCategory)

module.exports = router;
