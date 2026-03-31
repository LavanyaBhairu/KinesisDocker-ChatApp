import express from "express";
import { sendMessage, uploadFile, getMessages } from "../controllers/message.controller.js";
import upload from "../middleware/upload.js";
import Message from "../models/message.model.js"; // ✅ ADD THIS

const router = express.Router();

// ✅ FIXED: GET messages from DB
router.get("/:id", async (req, res) => {
	try {
		const { id: receiverId } = req.params;

		const messages = await Message.find({
			receiverId,
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);

	} catch (error) {
		console.log("Error fetching messages:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ✅ SEND MESSAGE
router.post("/:id", sendMessage);
router.post("/:id", getMessages);

// ✅ FILE UPLOAD
router.post("/upload", upload.single("file"), uploadFile);

export default router;