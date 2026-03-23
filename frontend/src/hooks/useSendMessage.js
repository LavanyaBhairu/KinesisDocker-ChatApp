import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();

	// 👇 CHANGE PARAM → now accepts object
	const sendMessage = async (data) => {
		setLoading(true);

		try {
			const res = await fetch(
				`/api/messages/send/${selectedConversation._id}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message: data.message || "",
						files: data.files || [],
					}),
				}
			);

			const result = await res.json();

			if (result.error) throw new Error(result.error);

			// 👇 append new message
			setMessages([...messages, result]);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};

export default useSendMessage;