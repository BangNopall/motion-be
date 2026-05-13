const express = require("express");
const router = express.Router();
const controller = require("../controllers/aspek.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

router.get("/", controller.getAllAspek);
router.get("/:id", controller.getAspekById);
router.get("/:column/:value", controller.getAspekByCol);
router.post("/", requireAdmin, controller.addAspek);
router.put("/:id", requireAdmin, controller.updateAspek);
router.delete("/:id", requireAdmin, controller.deleteAspek);

module.exports = router;
