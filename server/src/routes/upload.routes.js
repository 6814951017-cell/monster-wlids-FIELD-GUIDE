const express = require("express");
const { requireAdmin } = require("../middlewares/auth.middleware");
const { blobConfigured, presignUpload, completeUpload } = require("../uploads");

const router = express.Router();
router.get("/config", (req, res) => res.json({ enabled: blobConfigured() }));
router.post("/", requireAdmin, presignUpload);
router.post("/complete", requireAdmin, completeUpload);
module.exports = router;
