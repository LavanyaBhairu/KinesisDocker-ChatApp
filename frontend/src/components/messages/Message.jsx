import { useState, useRef } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";

const Message = ({ message }) => {
	if (!message) return null;

	const [showReactions, setShowReactions] = useState(false);
	const timeoutRef = useRef(null);
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const { socket } = useSocketContext();

	const fromMe = message?.senderId === authUser?._id;

	const formattedTime = message?.createdAt
		? extractTime(message.createdAt)
		: "";

	const chatClassName = fromMe ? "chat-end" : "chat-start";

	const profilePic = fromMe
		? authUser?.profilePic
		: selectedConversation?.profilePic;

	const bubbleBgColor = fromMe ? "bg-blue-500" : "";
	const shakeClass = message?.shouldShake ? "shake" : "";

	const BASE_URL = "http://localhost:5000";

	// ✅ MESSAGE STATUS
	const renderStatus = () => {
		if (!fromMe) return null;

		if (message.status === "sent") return "🕓";
		if (message.status === "delivered") return "✔";
		if (message.status === "seen") return "✔✔";

		return null;
	};

	// ✅ ADD / UPDATE REACTION
	const handleReaction = (emoji) => {
		if (!socket) return;

		socket.emit("reactMessage", {
			messageId: message._id,
			userId: authUser._id,
			emoji,
		});
	};

	// ✅ GROUP REACTIONS
	const groupedReactions = Object.values(
		(message.reactions || []).reduce((acc, r) => {
			acc[r.emoji] = acc[r.emoji] || { emoji: r.emoji, count: 0 };
			acc[r.emoji].count++;
			return acc;
		}, {})
	);

	return (
		<div className={`chat ${chatClassName}`}>
			{/* PROFILE */}
			<div className='chat-image avatar'>
				<div className='w-10 rounded-full'>
					<img
						alt='profile'
						src={
							profilePic ||
							`https://ui-avatars.com/api/?name=${
								fromMe
									? authUser?.fullName
									: selectedConversation?.fullName
							}`
						}
					/>
				</div>
			</div>

			{/* WRAPPER FOR HOVER */}
			<div
				className="relative inline-block"
				onMouseEnter={() => {
					clearTimeout(timeoutRef.current);
					setShowReactions(true);
				}}
				onMouseLeave={() => {
					timeoutRef.current = setTimeout(() => {
						setShowReactions(false);
					}, 200); // 👈 KEY FIX (delay)
				}}
			>
				
				{/* HOVER REACTION PICKER */}

				{showReactions && (
					<div
						className="absolute bottom-full left-0 mb-1 flex gap-1 bg-gray-800 px-2 py-1 rounded-full shadow-lg z-50"
						onMouseEnter={() => {
							clearTimeout(timeoutRef.current);
							setShowReactions(true);
						}}
						onMouseLeave={() => {
							timeoutRef.current = setTimeout(() => {
								setShowReactions(false);
							}, 200);
						}}
					>
						{["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
							<button
								key={emoji}
								onClick={() => handleReaction(emoji)}
								className="hover:scale-125 transition"
							>
								{emoji}
							</button>
						))}
					</div>
				)}

				{/* <div className="absolute left-0 bottom-full mb-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 flex gap-1 bg-gray-800 px-2 py-1 rounded-full shadow-lg z-50">
					{["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
						<button
							key={emoji}
							onClick={() => handleReaction(emoji)}
							className="hover:scale-125 transition"
						>
							{emoji}
						</button>
					))}
				</div> */}

				{/* MESSAGE BUBBLE */}
				<div
					className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2 flex flex-col gap-2`}
				>
					{/* TEXT */}
					{message.message && <p>{message.message}</p>}

					{/* FILES */}
					{Array.isArray(message.files) && message.files.length > 0 && (
						<div className='flex flex-wrap gap-2 mt-1'>
							{message.files.map((file, index) => {
								if (file.fileType?.startsWith("image")) {
									return (
										<img
											key={index}
											src={`${BASE_URL}${file.fileUrl}`}
											alt='chat-img'
											className='w-40 rounded-lg'
										/>
									);
								}

								if (file.fileType === "audio") {
									return (
										<div
											key={index}
											className='bg-gray-800 rounded-xl px-3 py-2 flex items-center gap-2 w-60'
										>
											<audio controls className='w-full'>
												<source
													src={`${BASE_URL}${file.fileUrl}`}
													type='audio/webm'
												/>
											</audio>
										</div>
									);
								}

								return (
									<a
										key={index}
										href={`${BASE_URL}${file.fileUrl}`}
										target='_blank'
										rel='noreferrer'
										className='text-blue-300 underline text-sm'
									>
										📎 File
									</a>
								);
							})}
						</div>
					)}

					{/* ✅ SHOW REACTIONS */}
					{groupedReactions.length > 0 && (
						<div className='flex gap-2 mt-1 flex-wrap'>
							{groupedReactions.map((r) => (
								<span
									key={r.emoji}
									className='text-xs bg-gray-700 px-2 py-1 rounded-full'
								>
									{r.emoji} {r.count}
								</span>
							))}
						</div>
					)}
				</div>
			</div>

			{/* FOOTER */}
			<div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>
				{formattedTime}
				{renderStatus()}
			</div>
		</div>
	);
};

export default Message;