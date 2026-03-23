import express from "express";
import { getMessages, sendMessage, uploadFile } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../middleware/upload.js"; 

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/upload", upload.single("file"), uploadFile);

// 👇 NEW ROUTE
// router.post("/upload", upload.single("file"), (req, res) => {
//   res.status(200).json({
//     fileUrl: `/uploads/${req.file.filename}`,
//     fileType: req.file.mimetype,
//   });
// });

export default router;