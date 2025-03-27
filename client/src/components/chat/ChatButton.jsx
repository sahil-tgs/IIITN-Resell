// client/src/components/chat/ChatButton.jsx
import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import ChatInterface from "./ChatInterface";
import axios from "axios";
import API_BASE_URL from "../../config/api";

const ChatButton = ({ sellerId, productId, productTitle, isDarkMode }) => {
    const [showChat, setShowChat] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const { user } = useAuth();

    const handleStartChat = async () => {
        if (sellerId === user.userId) {
            // Can't chat with yourself
            return;
        }

        setIsStartingChat(true);
        try {
            // Find or create conversation (product ID still sent for context)
            const response = await axios.post(
                `${API_BASE_URL}/chat/conversations`,
                {
                    participantId: sellerId,
                    productId: productId,
                    initialMessage: `Hi, I'm interested in "${productTitle}"`
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            // Get the conversation ID
            if (response.data && response.data._id) {
                setConversationId(response.data._id);
                setShowChat(true);
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            alert("Could not start conversation. Please try again.");
        } finally {
            setIsStartingChat(false);
        }
    };

    return (
        <>
            <button
                onClick={handleStartChat}
                disabled={isStartingChat || sellerId === user.userId}
                className={`flex items-center justify-center gap-2 px-6 py-3 ${
                    isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded-full transition-colors duration-200 ${
                    (isStartingChat || sellerId === user.userId) && "opacity-50 cursor-not-allowed"
                }`}
            >
                {isStartingChat ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Connecting...</span>
                    </>
                ) : (
                    <>
                        <MessageCircle size={20} />
                        <span>Contact Seller</span>
                    </>
                )}
            </button>

            {showChat && conversationId && (
                <ChatInterface
                    isDarkMode={isDarkMode}
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                    initialConversationId={conversationId}
                />
            )}
        </>
    );
};

export default ChatButton;