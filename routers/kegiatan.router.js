const express = require("express");
const router = express.Router();
const controller = require("../controllers/kegiatan.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

router.get("/", controller.getAllKegiatan);
router.get("/:id", controller.getKegiatanById);
router.post("/", requireAdmin, controller.addKegiatan);
router.put("/:id", requireAdmin, controller.updateKegiatan);
router.delete("/:id", requireAdmin, controller.deleteKegiatan);

module.exports = router;
