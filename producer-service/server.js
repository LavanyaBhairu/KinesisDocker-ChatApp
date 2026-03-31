import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import userRoutes from "./routes/user.js";

import { app, server } from "./socket/socket.js";
import connectToMongoDB from "./db/connectToMongoDB.js";

// const app = express(); ❌ already coming from socket

const PORT = process.env.PORT || 5000;

app.use(cors({
	origin: "http://localhost:3000",
	credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// ✅ Static uploads (optional)
app.use("/uploads", express.static("uploads"));

// ❌ REMOVE FRONTEND SERVING COMPLETELY
// app.get("*", ...)
// app.use((req,res)=>...)

 connectToMongoDB();

server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});