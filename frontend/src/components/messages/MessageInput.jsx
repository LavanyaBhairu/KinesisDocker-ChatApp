import { useState, useEffect, useRef } from "react";
import {
	BsSend,
	BsPaperclip,
	BsX,
	BsEmojiSmile,
	BsMic,
	BsStopFill,
} from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import useSendMessage from "../../hooks/useSendMessage";
import useConversation from "../../zustand/useConversation";
import axios from "axios";
import { useSocketContext } from "../../context/SocketContext";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [files, setFiles] = useState([]);
	const [previews, setPreviews] = useState([]);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const emojiRef = useRef(null);

	// 🎤 AUDIO
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [audioBlob, setAudioBlob] = useState(null);

	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const timerRef = useRef(null);
	const typingTimeoutRef = useRef(null);

	const { sendMessage, loading } = useSendMessage();
	const { selectedConversation } = useConversation();
	const { socket } = useSocketContext();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (emojiRef.current && !emojiRef.current.contains(event.target)) {
				setShowEmojiPicker(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// 🎤 START RECORDING
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);

			audioChunksRef.current = [];

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					audioChunksRef.current.push(e.data);
				}
			};

			recorder.onstop = () => {
				const blob = new Blob(audioChunksRef.current, {
					type: "audio/webm",
				});

				if (blob.size > 0) setAudioBlob(blob);

				audioChunksRef.current = [];
			};

			recorder.start();
			mediaRecorderRef.current = recorder;

			setIsRecording(true);
			setRecordingTime(0);

			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} catch (err) {
			console.error("Mic error:", err);
		}
	};

	// ⏹️ STOP RECORDING
	const stopRecording = () => {
		const recorder = mediaRecorderRef.current;
		if (!recorder || recorder.state === "inactive") return;

		recorder.stop();
		setIsRecording(false);
		clearInterval(timerRef.current);
	};

	// ❌ REMOVE AUDIO
	const removeAudio = () => {
		setAudioBlob(null);
	};

	// 😊 EMOJI
	const handleEmojiClick = (emojiData) => {
		setMessage((prev) => prev + emojiData.emoji);
	};

	// 📷 FILE PREVIEW
	useEffect(() => {
		const newPreviews = files.map((file) => {
			if (file.type.startsWith("image")) {
				return { type: "image", url: URL.createObjectURL(file) };
			}
			return { type: "file", name: file.name };
		});

		setPreviews(newPreviews);

		return () => {
			newPreviews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
		};
	}, [files]);

	// ✍️ TYPING
	const handleTyping = (e) => {
		const value = e.target.value;
		setMessage(value);

		if (!socket || !selectedConversation) return;

		socket.emit("typing", {
			receiverId: selectedConversation._id,
		});

		clearTimeout(typingTimeoutRef.current);

		typingTimeoutRef.current = setTimeout(() => {
			socket.emit("stopTyping", {
				receiverId: selectedConversation._id,
			});
		}, 1000);
	};

	// 📎 FILE
	const handleFiles = (newFiles) => {
		setFiles((prev) => [...prev, ...Array.from(newFiles)]);
	};

	const removeFile = (index) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// 📤 SEND (TEXT + FILE + AUDIO)
	const handleSubmit = async () => {
		const trimmedMessage = message.trim();

		if (!trimmedMessage && files.length === 0 && !audioBlob) return;

		let uploadedFiles = [];

		// upload files
		for (let file of files) {
			const formData = new FormData();
			formData.append("file", file);

			const res = await axios.post("/api/messages/upload", formData);

			uploadedFiles.push({
				fileUrl: res.data.fileUrl,
				fileType: res.data.fileType,
			});
		}

		// upload audio
		if (audioBlob) {
			const formData = new FormData();
			formData.append("file", audioBlob, "voice.webm");

			const res = await axios.post("/api/messages/upload", formData);

			uploadedFiles.push({
				fileUrl: res.data.fileUrl,
				fileType: "audio",
			});
		}

		await sendMessage({
			message: trimmedMessage,
			files: uploadedFiles,
		});

		setMessage("");
		setFiles([]);
		setAudioBlob(null);
		setShowEmojiPicker(false);
	};

	return (
		<div className="px-4 py-2 bg-[#202c33] border-t border-gray-700">

			{/* FILE PREVIEW */}
			{files.length > 0 && (
				<div className="flex gap-2 mb-2 flex-wrap">
					{previews.map((p, index) => (
						<div key={index} className="relative">
							{p.type === "image" ? (
								<img src={p.url} className="w-20 h-20 object-cover rounded" />
							) : (
								<div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
									📎 {p.name}
								</div>
							)}
							<button
								onClick={() => removeFile(index)}
								className="absolute top-0 right-0 bg-black text-white rounded-full p-1"
							>
								<BsX size={12} />
							</button>
						</div>
					))}
				</div>
			)}

			{/* AUDIO PREVIEW */}
			{audioBlob && (
				<div className="mb-2 flex items-center gap-2">
					<audio controls src={URL.createObjectURL(audioBlob)} />
					<button
						onClick={removeAudio}
						className="bg-red-500 text-white px-2 py-1 rounded"
					>
						<BsX />
					</button>
				</div>
			)}

			{/* INPUT BAR */}
			<div className="flex items-center bg-[#2a3942] rounded-full px-4 py-2 gap-3">

				<label className="cursor-pointer text-gray-300 text-xl hover:text-white">
					<BsPaperclip />
					<input type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
				</label>

				<button
					onClick={() => setShowEmojiPicker((prev) => !prev)}
					className="text-gray-300 text-xl hover:text-white"
				>
					<BsEmojiSmile />
				</button>

				<input
					type="text"
					value={message}
					onChange={handleTyping}
					placeholder="Type a message"
					className="flex-1 bg-transparent outline-none text-white text-sm"
					onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
				/>

				{/* 🎤 AUDIO CONTROLS */}
				{!isRecording ? (
					<button onClick={startRecording} className="text-white text-xl">
						<BsMic />
					</button>
				) : (
					<div className="flex items-center gap-2 text-red-500">
						<span className="animate-pulse">●</span>
						<span>{recordingTime}s</span>
						<button onClick={stopRecording}>
							<BsStopFill />
						</button>
					</div>
				)}

				{/* SEND */}
				<button onClick={handleSubmit} className="text-white text-xl">
					{loading ? "..." : <BsSend />}
				</button>

				{showEmojiPicker && (
					<div ref={emojiRef} 
					className="absolute bottom-14 right-0 z-50">
						<EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
					</div>
				)}
			</div>
		</div>
	);
};

export default MessageInput;