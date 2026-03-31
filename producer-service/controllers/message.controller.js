import AWS from "aws-sdk";
import Conversation from "../models/conversation.model.js";

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const kinesis = new AWS.Kinesis();

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;

    const senderId = "test-user";

    const params = {
      Data: JSON.stringify({
        senderId,
        receiverId,
        message,
        time: new Date(),
      }),
      PartitionKey: Date.now().toString(),
      StreamName: "chat-stream",
    };

    await kinesis.putRecord(params).promise();

    console.log("✅ Sent to Kinesis:", message);

    console.log("AWS CONFIG:", AWS.config.credentials);

    res.status(200).json({ success: true });

  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = "test_user";

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    res.status(200).json({ messages: conversation.messages });
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Optional: keep upload
export const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let fileType = "file";

    if (file.mimetype.startsWith("image")) fileType = "image";
    else if (file.mimetype.startsWith("audio")) fileType = "audio";

    res.status(200).json({
      fileUrl: `/uploads/${file.filename}`,
      fileType,
    });

  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
};