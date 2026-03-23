import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = () => {
	const { messages = [], loading } = useGetMessages();
	console.log("MESSAGES ARRAY:", messages);

	const safeMessages = Array.isArray(messages) ? messages : [];
	useListenMessages();
	const lastMessageRef = useRef();

	console.log("TYPE OF MESSAGES:", typeof messages);
	console.log("IS ARRAY:", Array.isArray(messages));
	console.log("MESSAGES:", messages);

	useEffect(() => {
		setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages]);

	return (
		<div className='px-4 flex-1 overflow-auto'>
			{!loading &&
				safeMessages.length > 0 &&
				safeMessages
				.filter((msg) => msg && msg._id)
				.map((message, index) => (
					<div
					key={message._id || index}
					ref={index === safeMessages.length - 1 ? lastMessageRef : null}
					>
					<Message message={message} />
					</div>
			))}

			{loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
			{!loading && messages.length === 0 && (
				<p className='text-center'>Send a message to start the conversation</p>
			)}
		</div>
	);
};
export default Messages;


// STARTER CODE SNIPPET
// import Message from "./Message";
// import useGetMessages from "../../hooks/useGetMessages";

// const Messages = () => {
// 	const { messages, loading } = useGetMessages();
// console.log("messages:", messages);

// 	return (
// 		<div className='px-4 flex-1 overflow-auto'>
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 			<Message />
// 		</div>
// 	);
// };
// export default Messages;