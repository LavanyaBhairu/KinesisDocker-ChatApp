import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
	try {
		const { message, files } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		// ✅ VALIDATION
		if ((!message || message.trim() === "") && (!files || files.length === 0)) {
			return res.status(400).json({ error: "Message or file required" });
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message: message || "",
			files: files || []
		});

		conversation.messages.push(newMessage._id);

		await Promise.all([conversation.save(), newMessage.save()]);

		// ✅ SOCKET SEND
		const receiverSocketId = getReceiverSocketId(receiverId);

		if (receiverSocketId) {
			// ✅ mark as delivered
			newMessage.status = "delivered";
			await newMessage.save();

			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", {
				...newMessage._doc,
			});
			io.to(receiverSocketId).emit("messageSeen", newMessage._id);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

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

export const uploadFile = async (req, res) => {
	try {
		const file = req.file;

		if (!file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		let fileType = "file";

		if (file.mimetype.startsWith("image")) {
			fileType = "image";
		} else if (file.mimetype.startsWith("audio")) {
			fileType = "audio";
		}

		const fileUrl = `/uploads/${file.filename}`;

		res.status(200).json({
			fileUrl,
			fileType,
		});
	} catch (error) {
		console.error("Upload error:", error);
		res.status(500).json({ error: "Upload failed" });
	}
};