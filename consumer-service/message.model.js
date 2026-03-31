import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: String,
  message: String,
  timestamp: String,
});

export default mongoose.model("Message", messageSchema);