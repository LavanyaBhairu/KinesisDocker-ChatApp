import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { messages, setMessages } = useConversation();

	useEffect(() => {
		if (!socket) return;

		const handleNewMessage = (newMessage) => {
			newMessage.shouldShake = true;

			newMessage.status = newMessage.status || "sent";

			const sound = new Audio(notificationSound);
			sound.play();

			// ✅ SAFE UPDATE (NO FUNCTION)
			const exists = messages.find((m) => m._id === newMessage._id);
			if (exists) return;

			setMessages([...messages, newMessage]);
		};

		socket.on("newMessage", handleNewMessage);

		return () => {
			socket.off("newMessage", handleNewMessage);
		};
	}, [socket, messages, setMessages]);
};

export default useListenMessages;