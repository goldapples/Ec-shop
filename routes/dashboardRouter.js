const router = require("express").Router();
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const dashboardController = require("../controllers/dashboardCtr");

router.post("/dashboard/nutchart", requireAuth, dashboardController.nutChart);
router.post("/dashboard/linechart", requireAuth, dashboardController.lineChart);
// router.get("/category/categorylist", requireAuth, categoryController.getAllCategories);
// router.put("/category/:id", requireAuth, categoryController.editCategory);
// router.delete("/category/:id", requireAuth, categoryController.deleteCategory);
// router.get("/category/:id", requireAuth, categoryController.getACategory);
// router.delete("/category/mutidelete", requireAuth, categoryController.multiDeleteCategory)

module.exports = router;
