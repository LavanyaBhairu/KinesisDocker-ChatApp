import User from "../models/user.model.js";

// export const getUsersForSidebar = async (req, res) => {
// 	try {
// 		const users = await User.find({
// 			_id: { $ne: req.user._id },
// 		}).select("-password"); // optional

// 		res.status(200).json(users); // ✅ now defined
// 	} catch (error) {
// 		console.log("Error in getUsersForSidebar:", error.message);
// 		res.status(500).json({ error: "Internal server error" });
// 	}
// };

export const getUsersForSidebar = async (req, res) => {
	try {
		// ✅ No DB call in producer
		const users = [
			{ _id: "123", fullName: "Demo User" },
			{ _id: "456", fullName: "Test User" }
		];

		res.status(200).json(users);
	} catch (error) {
		console.log("Error in getUsersForSidebar:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};