import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "./AuthContext";
import useConversation from "../zustand/useConversation";

// CREATE CONTEXT
const SocketContext = createContext(null);

export const useSocketContext = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocketContext must be used inside SocketContextProvider");
	}
	return context;
};

// PROVIDER
export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);

	const { authUser } = useAuthContext();
	const { setMessages } = useConversation(); // ✅ only need setter

	// 🔌 CONNECT SOCKET
	useEffect(() => {
		if (!authUser) return;

		const newSocket = io("http://localhost:5000", {
			query: { userId: authUser._id },
		});

		setSocket(newSocket);

		// 👥 ONLINE USERS
		newSocket.on("getOnlineUsers", setOnlineUsers);

		return () => {
			newSocket.close();
		};
	}, [authUser]);

	// 📩 SOCKET EVENTS (SEEN + DELIVERED)
	useEffect(() => {
		if (!socket) return;

		// ✅ MESSAGE SEEN
		const handleSeen = ({ messageId }) => {
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id === messageId
						? { ...msg, status: "seen" }
						: msg
				)
			);
		};

		// ✅ MESSAGE DELIVERED
		const handleDelivered = (updatedMessage) => {
			console.log("DELIVERED EVENT:", updatedMessage);
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id === updatedMessage._id
						? { ...msg, status: "delivered" }
						: msg
				)
			);
		};

		// 🎯 REGISTER EVENTS
		socket.on("messageSeen", handleSeen);
		socket.on("messageDelivered", handleDelivered);

		// 🧹 CLEANUP
		return () => {
			socket.off("messageSeen", handleSeen);
			socket.off("messageDelivered", handleDelivered);
		};
	}, [socket, setMessages]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};