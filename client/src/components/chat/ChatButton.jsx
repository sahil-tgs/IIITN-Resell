// client/src/components/chat/ChatButton.jsx
import React, { useState, useEffect } from "react";
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
    const { conversations, startConversation, fetchConversations } = useChat();

    // Find existing conversation when component mounts or conversations change
    useEffect(() => {
        if (conversations?.length > 0 && sellerId && user?.userId) {
            const existingConv = conversations.find(conv =>
                conv.participants.some(p =>
                    typeof p === 'object' ? p._id === sellerId : p === sellerId
                )
            );

            if (existingConv) {
                console.log("Found existing conversation:", existingConv._id);
                setConversationId(existingConv._id);
            }
        }
    }, [conversations, sellerId, user?.userId]);

    const handleStartChat = async () => {
        if (sellerId === user?.userId) {
            console.log("Can't chat with yourself");
            return;
        }

        setIsStartingChat(true);

        try {
            // First check if we already have a conversation ID from our effect
            if (conversationId) {
                console.log("Opening existing conversation:", conversationId);
                setShowChat(true);
                setIsStartingChat(false);
                return;
            }

            // If we get here, we need to check the API directly one more time
            const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            const existingConv = response.data.find(conv =>
                conv.participants.some(p =>
                    typeof p === 'object' ? p._id === sellerId : p === sellerId
                )
            );

            if (existingConv) {
                console.log("Found existing conversation from API:", existingConv._id);
                setConversationId(existingConv._id);
                setShowChat(true);
            } else {
                // Create a new conversation
                console.log("Creating new conversation");
                const newConvId = await startConversation(
                    sellerId,
                    productId,
                    `Hi, I'm interested in "${productTitle}"`
                );

                if (newConvId) {
                    console.log("Created new conversation:", newConvId);
                    setConversationId(newConvId);
                    // Force refresh conversations
                    await fetchConversations();
                    setShowChat(true);
                } else {
                    throw new Error("Failed to create conversation");
                }
            }
        } catch (error) {
            console.error("Error in handleStartChat:", error);
            alert("Could not start conversation. Please try again.");
        } finally {
            setIsStartingChat(false);
        }
    };

    return (
        <>
            <button
                onClick={handleStartChat}
                disabled={isStartingChat || sellerId === user?.userId}
                className={`flex items-center justify-center gap-2 px-6 py-3 ${
                    isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded-full transition-colors duration-200 ${
                    (isStartingChat || sellerId === user?.userId) && "opacity-50 cursor-not-allowed"
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