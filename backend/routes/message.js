import express from "express";
import { sendMessage, uploadFile } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../middleware/upload.js"; 
import { sendMessageToKinesis } from "../producer.js";

const router = express.Router();

//router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", async (req, res) => {
  try {
    const { id: roomId } = req.params;
    const { message } = req.body;

    const messageData = {
      roomId,
      message,
      timestamp: new Date().toISOString(),
    };

    // 🔥 Send to Kinesis
    await sendMessageToKinesis(messageData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.post("/upload", upload.single("file"), uploadFile);

// 👇 NEW ROUTE
// router.post("/upload", upload.single("file"), (req, res) => {
//   res.status(200).json({
//     fileUrl: `/uploads/${req.file.filename}`,
//     fileType: req.file.mimetype,
//   });
// });

export default router;