// client/src/components/ChatFloatingButton.jsx
import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatInterface from "./chat/ChatInterface";
import { useChat } from "../context/ChatContext";
import { useLocation } from "react-router-dom";

const ChatFloatingButton = ({ isDarkMode }) => {
    const [showChat, setShowChat] = useState(false);
    const { unreadMessages } = useChat();
    const location = useLocation();

    // Calculate total unread messages
    const totalUnread = Object.values(unreadMessages || {}).reduce((sum, count) => sum + count, 0);

    // Hide the button if we're on the Messages page
    if (location.pathname === "/messages") {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setShowChat(!showChat)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-40 ${
                    isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors duration-200`}
            >
                {showChat ? (
                    <X size={24} />
                ) : (
                    <div className="relative">
                        <MessageCircle size={24} />
                        {totalUnread > 0 && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                                {totalUnread > 9 ? '9+' : totalUnread}
                            </div>
                        )}
                    </div>
                )}
            </button>

            <ChatInterface
                isDarkMode={isDarkMode}
                isOpen={showChat}
                onClose={() => setShowChat(false)}
            />
        </>
    );
};

export default ChatFloatingButton;