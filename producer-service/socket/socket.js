import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:3000"],
		methods: ["GET", "POST"],
		credentials: true,
	},
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", async (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId != "undefined") userSocketMap[userId] = socket.id;

	// await User.findByIdAndUpdate(userId, {
	// 	lastSeen: null,
	// });

	// io.emit() is used to send events to all the connected clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	socket.on("typing", ({ to }) => {
		const receiverSocketId = userSocketMap[to];
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("typing", socket.id);
		}
	});

	socket.on("stopTyping", ({ to }) => {
		const receiverSocketId = userSocketMap[to];
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("stopTyping");
		}
	});

	// socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", async () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];

		// ✅ UPDATE LAST SEEN
		
		// await User.findByIdAndUpdate(userId, {
		// 	lastSeen: new Date(),
		// });
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});

	 // WHEN MESSAGE SENT → DELIVERED
	socket.on("sendMessage", async (message) => {
	const receiverSocketId = getReceiverSocketId(message.receiverId);

	// update DB
	const updatedMessage = await Message.findByIdAndUpdate(
		message._id,
		{ status: receiverSocketId ? "delivered" : "sent" },
		{ new: true }
	);

	// send to receiver
	if (receiverSocketId) {
		message.status = "delivered";
		io.to(receiverSocketId).emit("newMessage", updatedMessage);
	}

	// ALSO notify sender
	const senderSocketId = getReceiverSocketId(message.senderId);
	if (senderSocketId) {
		io.to(senderSocketId).emit("messageDelivered", updatedMessage);
	}
});

	 // ✅ WHEN MESSAGE SEEN
	socket.on("markSeen", async ({ messageId }) => {
		// update DB
		await Message.findByIdAndUpdate(messageId, {
		status: "seen",
		});

		// notify sender
		const message = await Message.findById(messageId);
		const senderSocketId = getReceiverSocketId(message.senderId);

		if (senderSocketId) {
		io.to(senderSocketId).emit("messageSeen", {
			messageId,
		});
		}
	});

	socket.on("reactMessage", async ({ messageId, userId, emoji }) => {
	try {
		const message = await Message.findById(messageId);

		// check if user already reacted
		const existingReaction = message.reactions.find(
			(r) => r.userId.toString() === userId
		);

		if (existingReaction) {
			// update emoji
			existingReaction.emoji = emoji;
		} else {
			// add new reaction
			message.reactions.push({ userId, emoji });
		}

		await message.save();

		// send update to both users
		const receiverSocketId = getReceiverSocketId(message.receiverId);
		const senderSocketId = getReceiverSocketId(message.senderId);

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageReacted", message);
		}
		if (senderSocketId) {
			io.to(senderSocketId).emit("messageReacted", message);
		}
	} catch (err) {
		console.log("Reaction error:", err.message);
	}
});

});

export { app, io, server };