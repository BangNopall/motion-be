const express = require("express");
const router = express.Router();
const controller = require("../controllers/rapor.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

router.get("/", requireAdmin, controller.getAllRapor);
router.post("/", requireAdmin, controller.addRapor);
router.put("/:id", requireAdmin, controller.editRapor);
router.delete("/:id", requireAdmin, controller.deleteRapor);

module.exports = router;
