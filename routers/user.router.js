const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const {
	authenticate,
	requireAdmin,
	requireSelfOrAdmin,
} = require("../middleware/auth.middleware");
const multer = require("multer");
const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
});

router.get("/", controller.getAllUser);
router.get("/:nim", controller.getUserByNim);
router.get(
	"/kementerian/:id_kementerian/jabatan/:id_jabatan",
	controller.getUserByKementerianJabatan
);
router.get("/:nim/rapor", requireSelfOrAdmin("nim"), controller.getRaporByNim);
router.get("/:nim/rapor/:turn", requireSelfOrAdmin("nim"), controller.getRaporByTurnNim);
router.get("/:nim/absensi/:turn", requireSelfOrAdmin("nim"), controller.getAbsensiByTurnNim);
router.post("/", requireAdmin, upload.single("foto"), controller.addUser);
router.post("/login", controller.login);
router.put("/:nim", requireAdmin, upload.single("foto"), controller.updateUser);
router.delete("/:nim", requireAdmin, controller.deleteUser);

module.exports = router;
