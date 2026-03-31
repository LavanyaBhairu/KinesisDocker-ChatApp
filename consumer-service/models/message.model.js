import mongoose from "mongoose";
import { type } from "node:os";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: String,
			// type: mongoose.Schema.Types.ObjectId,
			// ref: "User",
			// required: true,
		},
		receiverId: {
			type: String,
			// type: mongoose.Schema.Types.ObjectId,
			// ref: "User",
			// required: true,
		},
		message: {
			type: String,
			default: "",
		},
		files: [
		{
			fileUrl: String,
			fileType: String,
		},
		],
		reactions: [
		{
			userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			},
			emoji: String,
		},
		],
		status: {
		type: String,
		enum: ["sent", "delivered", "seen"],
		default: "sent",
	},
		// createdAt, updatedAt
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;