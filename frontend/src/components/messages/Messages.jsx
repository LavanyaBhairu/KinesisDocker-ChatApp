import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Messages = () => {
	const { messages = [], loading } = useGetMessages();
	const { socket } = useSocketContext();
	const { setMessages } = useConversation();

	const safeMessages = Array.isArray(messages) ? messages : [];
	useListenMessages();
	const lastMessageRef = useRef();

	// ✅ AUTO SCROLL
	useEffect(() => {
		setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages]);

	// ✅ LISTEN REACTIONS
	useEffect(() => {
		if (!socket) return;

		const handleReaction = (updatedMessage) => {
			setMessages(
				messages.map((msg) =>
					msg._id === updatedMessage._id ? updatedMessage : msg
				)
			);
		};

		socket.on("messageReacted", handleReaction);

		return () => socket.off("messageReacted", handleReaction);
	}, [socket, messages, setMessages]);

	return (
		<div className='px-4 flex-1 overflow-y-auto min-h-0'>
			{!loading &&
				safeMessages.length > 0 &&
				safeMessages.map((message, index) => (
					<div
						key={message._id || index}
						ref={
							index === safeMessages.length - 1
								? lastMessageRef
								: null
						}
					>
						<Message message={message} />
					</div>
				))}

			{loading &&
				[...Array(3)].map((_, idx) => (
					<MessageSkeleton key={idx} />
				))}

			{!loading && safeMessages.length === 0 && (
				<p className='text-center'>
					Send a message to start the conversation
				</p>
			)}
		</div>
	);
};

export default Messages;