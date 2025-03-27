// client/src/components/chat/ChatInterface.jsx
import React, { useState, useEffect } from "react";
import { X, MessageSquare, ChevronLeft } from "lucide-react";
import ConversationsList from "./ConversationsList";
import MessagesList from "./MessagesList";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

const ChatInterface = ({ isDarkMode, isOpen, onClose, initialConversationId = null }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const { setActiveConversation, conversations } = useChat();
    const { user } = useAuth();

    useEffect(() => {
        if (initialConversationId) {
            setSelectedConversation(initialConversationId);
            setActiveConversation(initialConversationId);
        }
    }, [initialConversationId, setActiveConversation]);

    const handleSelectConversation = (conversationId) => {
        setSelectedConversation(conversationId);
        setActiveConversation(conversationId);
    };

    const handleBack = () => {
        setSelectedConversation(null);
        setActiveConversation(null);
    };

    // Find conversation data
    const currentConversation = conversations.find(
        (c) => c._id === selectedConversation
    );

    // Get other participant from conversation
    const getOtherParticipant = (conversation) => {
        if (!conversation || !conversation.participants) return null;
        return conversation.participants.find(
            (p) => p._id !== user.userId
        );
    };

    const otherParticipant = currentConversation
        ? getOtherParticipant(currentConversation)
        : null;

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-4 z-50 flex flex-col shadow-xl rounded-t-xl overflow-hidden w-96 max-w-full">
            {/* Header */}
            <div
                className={`p-4 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                } border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
            >
                <div className="flex justify-between items-center">
                    <h2 className="font-bold flex items-center">
                        <MessageSquare className="mr-2" size={20} />
                        {selectedConversation
                            ? otherParticipant?.username || "Chat"
                            : "Messages"}
                    </h2>
                    <div className="flex items-center gap-2">
                        {selectedConversation && (
                            <button
                                onClick={handleBack}
                                className={`p-2 rounded-full ${
                                    isDarkMode
                                        ? "hover:bg-gray-700"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full ${
                                isDarkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content - Fixed height container with scrolling */}
            <div
                className={`${
                    isDarkMode ? "bg-gray-900" : "bg-gray-50"
                } max-h-[480px] h-[480px] overflow-hidden`}
            >
                {selectedConversation ? (
                    <MessagesList
                        conversationId={selectedConversation}
                        isDarkMode={isDarkMode}
                    />
                ) : (
                    <div className="h-full overflow-y-auto">
                        <ConversationsList
                            isDarkMode={isDarkMode}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;