import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation, messages } = useConversation();
	const { socket, onlineUsers } = useSocketContext();

	const [isTyping, setIsTyping] = useState(false);

	useEffect(() => {
		return () => setSelectedConversation(null);
	}, []);

	// LISTEN TYPING
	useEffect(() => {
		if (!socket) return;

		const handleTyping = () => setIsTyping(true);
		const handleStopTyping = () => setIsTyping(false);

		socket.on("typing", handleTyping);
		socket.on("stopTyping", handleStopTyping);

		return () => {
			socket.off("typing", handleTyping);
			socket.off("stopTyping", handleStopTyping);
		};
	}, [socket]);

	useEffect(() => {
		if (!messages || !selectedConversation || !socket) return;

		const unseenMessages = messages.filter(
			(msg) =>
			msg.senderId === selectedConversation._id &&
			msg.status !== "seen"
		);

		unseenMessages.forEach((msg) => {
			socket.emit("markSeen", {
			messageId: msg._id,
			});
		});

		}, [messages, selectedConversation, socket]);

		const isOnline = onlineUsers?.includes(selectedConversation?._id);

		const getLastSeen = (lastSeen) => {
			if (!lastSeen) return "";

			const diff = Math.floor((Date.now() - new Date(lastSeen)) / 1000);

			if (diff < 60) return "last seen just now";
			if (diff < 3600) return `last seen ${Math.floor(diff / 60)} min ago`;
			if (diff < 86400) return `last seen ${Math.floor(diff / 3600)} hr ago`;

			return `last seen ${Math.floor(diff / 86400)} days ago`;
		};

	return (
		<div className='md:min-w-[450px] flex flex-col'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					<div className='bg-slate-500 px-4 py-2 mb-2'>
						<p className='text-gray-900 font-bold'>
							To: {selectedConversation.fullName}
						</p>

						<p className='text-sm text-gray-200'>
							{isOnline
								? "🟢 Online"
								: getLastSeen(selectedConversation.lastSeen)}
						</p>
					</div>

					{/* ✅ TYPING UI */}
					{isTyping && (
						<p className="text-sm text-gray-400 px-4">Typing...</p>
					)}

					<Messages />
					<MessageInput />
				</>
			)}
		</div>
	);
};

export default MessageContainer;

const NoChatSelected = () => {
	const { authUser } = useAuthContext();

	return (
		<div className="flex items-center justify-center w-full h-full">
			<div className="text-center flex flex-col items-center justify-center gap-2 text-gray-200">
				
				<p className="text-xl font-semibold">
					Welcome 👋 {authUser?.fullName}
				</p>

				<p className="text-sm text-gray-300">
					Select a chat
				</p>

			<TiMessages className="text-5xl mt-2 opacity-80 animate-bounce" />
			</div>
		</div>
	);
};