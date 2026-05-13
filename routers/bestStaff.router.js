const express = require("express");
const router = express.Router();
const controller = require("../controllers/bestStaff.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

router.get("/", controller.getAllBestStaff);
router.get("/:phase", controller.getBestStaffByPhase);
router.post("/", requireAdmin, controller.addBestStaff);
router.put("/:id", requireAdmin, controller.updateBestStaff);
router.delete("/:id", requireAdmin, controller.deleteBestStaff);
module.exports = router;
