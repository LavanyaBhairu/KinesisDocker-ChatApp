import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const Message = ({ message }) => {

	console.log("MESSAGE COMPONENT RECEIVED:", message);
	if (!message) return null;

	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();

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

	const renderStatus = () => {
		if (!fromMe) return null;

		if (message.status === "sent") return "🕓";
		if (message.status === "delivered") return "✔";
		if (message.status === "seen") return "✔✔";

		return null;
	};

	return (
		<div className={`chat ${chatClassName}`}>
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

			<div
				className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2 flex flex-col gap-2`}
			>
				{message.message && <p>{message.message}</p>}

				{Array.isArray(message.files) && message.files.length > 0 && (
	<div className='flex flex-wrap gap-2 mt-1'>
		{message.files.map((file, index) => {
			
			// 🖼️ IMAGE
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

			// AUDIO
			if (file.fileType === "audio") {
				return (
					<div key={index} className="bg-gray-800 rounded-xl px-3 py-2 flex items-center gap-2 w-60">
						<audio controls className="w-full">
							<source
								src={`${BASE_URL}${file.fileUrl}`}
								type="audio/webm"
							/>
						</audio>
					</div>
				);
			}

			// OTHER FILE
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
			</div>

			<div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>
				{formattedTime}
				{renderStatus()}
			</div>
		</div>

		
	);
};

export default Message;