import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("✅ Consumer DB connected");
  } catch (error) {
    console.error("DB error:", error);
  }
};