// client/src/components/chat/MessagesList.jsx
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import { Send, Paperclip } from "lucide-react";

const MessagesList = ({ conversationId, isDarkMode }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messageInput, setMessageInput] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const { socket, markConversationAsRead } = useChat();
    const conversationJoinedRef = useRef(false);

    // Fetch messages when component loads or conversationId changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId || !user?.token) return;

            try {
                setLoading(true);
                const response = await axios.get(
                    `${API_BASE_URL}/chat/conversations/${conversationId}/messages?page=${page}`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }
                );

                const newMessages = response.data.messages;

                if (page === 1) {
                    setMessages(newMessages);
                    // Scroll to bottom on initial load
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                } else {
                    setMessages(prev => [...newMessages, ...prev]);
                }

                setHasMore(page < response.data.totalPages);
                if (markConversationAsRead) {
                    markConversationAsRead(conversationId);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [conversationId, page, user?.token]);

    // Set up socket connection and event listeners
    useEffect(() => {
        if (!socket || !conversationId || !user?.userId) return;

        console.log("Setting up socket listeners for conversation:", conversationId);

        // Join conversation room if not already joined
        if (!conversationJoinedRef.current) {
            socket.emit("join_conversation", conversationId);
            conversationJoinedRef.current = true;
            console.log("Joined conversation room:", conversationId);
        }

        // Handle receiving new messages
        const handleReceiveMessage = (message) => {
            console.log("Received message:", message);

            // Only add the message if it's for this conversation and not from the current user
            // to avoid duplicates with our optimistic UI updates
            if (message.conversation === conversationId && message.sender._id !== user.userId) {
                console.log("Adding received message to state");
                setMessages(prev => {
                    // Check if message already exists (avoid duplicates)
                    const exists = prev.some(m => m._id === message._id);
                    if (exists) return prev;
                    return [...prev, message];
                });

                // Scroll to bottom for new messages
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);

                // Mark as read
                if (markConversationAsRead) {
                    markConversationAsRead(conversationId);
                }
            }
        };

        // Listen for message events
        socket.on("receive_message", handleReceiveMessage);

        // Cleanup function
        return () => {
            console.log("Cleaning up socket listeners");
            socket.off("receive_message", handleReceiveMessage);
            conversationJoinedRef.current = false;
        };
    }, [socket, conversationId, user?.userId, markConversationAsRead]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !socket || !conversationId) return;

        const messageText = messageInput.trim();

        // Create a temporary message object for immediate UI update
        const tempMessage = {
            _id: `temp-${Date.now()}`, // temporary ID
            content: messageText,
            sender: {
                _id: user.userId,
                username: user.username,
                profilePicture: user.profilePicture
            },
            createdAt: new Date().toISOString(),
            isRead: false,
            conversation: conversationId
        };

        // Add message to UI immediately
        setMessages(prev => [...prev, tempMessage]);

        // Clear input
        setMessageInput("");

        // Scroll to bottom
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        // Send message to server
        console.log("Sending message to server:", { conversationId, content: messageText });
        socket.emit("send_message", {
            conversationId,
            content: messageText,
        });
    };

    const loadMoreMessages = () => {
        if (hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    };

    // Render message bubbles
    const renderMessage = (message) => {
        const isSentByMe = message.sender._id === user.userId;

        return (
            <div
                key={message._id}
                className={`mb-4 flex ${isSentByMe ? "justify-end" : "justify-start"}`}
            >
                {!isSentByMe && (
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                        {message.sender.profilePicture ? (
                            <img
                                src={message.sender.profilePicture}
                                alt={message.sender.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className={`w-full h-full flex items-center justify-center ${
                                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                }`}
                            >
                                {message.sender.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}

                <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isSentByMe
                            ? isDarkMode
                                ? "bg-blue-600 text-white"
                                : "bg-blue-500 text-white"
                            : isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-gray-200 text-gray-800"
                    }`}
                >
                    <p>{message.content}</p>
                    <p
                        className={`text-xs mt-1 ${
                            isSentByMe
                                ? "text-blue-100"
                                : isDarkMode
                                    ? "text-gray-400"
                                    : "text-gray-500"
                        }`}
                    >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
                {hasMore && (
                    <div className="text-center mb-4">
                        <button
                            onClick={loadMoreMessages}
                            className={`px-4 py-2 rounded-full text-sm ${
                                isDarkMode
                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                            }`}
                        >
                            Load earlier messages
                        </button>
                    </div>
                )}

                {loading && page === 1 ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    messages.map(renderMessage)
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div
                className={`p-4 border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
            >
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-2 rounded-full border ${
                            isDarkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                        type="button"
                        className={`p-2 rounded-full ${
                            isDarkMode
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                    >
                        <Paperclip size={20} />
                    </button>
                    <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className={`p-2 rounded-full ${
                            isDarkMode
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                        } ${!messageInput.trim() && "opacity-50 cursor-not-allowed"}`}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessagesList;