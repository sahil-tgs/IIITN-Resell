// client/src/pages/MessagesPage.jsx
import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import ConversationsList from "../components/chat/ConversationsList";
import MessagesList from "../components/chat/MessagesList";
import { MessageCircle } from "lucide-react";

const MessagesPage = ({ isDarkMode }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const { setActiveConversation, conversations, loading } = useChat();
    const { user } = useAuth();

    const handleSelectConversation = (conversationId) => {
        setSelectedConversation(conversationId);
        setActiveConversation(conversationId);
    };

    return (
        <div
            className={`min-h-screen ${
                isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Messages</h1>

                <div
                    className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                    } rounded-xl shadow-lg overflow-hidden`}
                >
                    {/* Conversations Sidebar */}
                    <div
                        className={`border-r ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                    >
                        <div className="h-[600px] overflow-y-auto">
                            <ConversationsList
                                isDarkMode={isDarkMode}
                                onSelectConversation={handleSelectConversation}
                            />
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="md:col-span-2">
                        {selectedConversation ? (
                            <div className="h-[600px]">
                                <MessagesList
                                    conversationId={selectedConversation}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        ) : (
                            <div className="h-[600px] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <MessageCircle size={48} className="mx-auto text-gray-400" />
                                    </div>
                                    <h2 className="text-xl font-medium mb-2">
                                        Select a conversation
                                    </h2>
                                    <p
                                        className={`${
                                            isDarkMode ? "text-gray-400" : "text-gray-600"
                                        }`}
                                    >
                                        Choose a conversation from the sidebar to view messages
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;