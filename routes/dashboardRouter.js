const router = require("express").Router();
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const dashboardController = require("../controllers/dashboardCtr");

router.post("/dashboard/nutchart", requireAuth, dashboardController.nutChart);
router.post("/dashboard/linechart", requireAuth, dashboardController.lineChart);
router.get("/dashboard/stats", requireAuth, dashboardController.getStats);

module.exports = router;
