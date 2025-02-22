// client/src/components/chat/ConversationsList.jsx
import React from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const ConversationsList = ({ isDarkMode, onSelectConversation }) => {
    const { conversations, unreadMessages, activeConversation, loading } = useChat();
    const { user } = useAuth();

    // Get other participant from conversation
    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(
            (p) => p._id !== user.userId
        );
    };

    // Format last message preview
    const getMessagePreview = (conversation) => {
        if (!conversation.lastMessage) return "No messages yet";

        const message = conversation.lastMessage;
        if (message.sender._id === user.userId) {
            return `You: ${message.content}`;
        }
        return message.content;
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "";
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center py-8">
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    No conversations yet
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isActive = activeConversation === conversation._id;
                const hasUnread = unreadMessages[conversation._id] > 0;

                return (
                    <div
                        key={conversation._id}
                        onClick={() => onSelectConversation(conversation._id)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 ${
                            isActive ? (isDarkMode ? "bg-gray-800" : "bg-gray-50") : ""
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                    {otherParticipant?.profilePicture ? (
                                        <img
                                            src={otherParticipant.profilePicture}
                                            alt={otherParticipant.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className={`w-full h-full flex items-center justify-center ${
                                                isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                            } text-lg font-semibold`}
                                        >
                                            {otherParticipant?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {hasUnread && (
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full"></div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <h3
                                        className={`font-semibold truncate ${
                                            isDarkMode ? "text-white" : "text-gray-900"
                                        }`}
                                    >
                                        {otherParticipant?.username}
                                    </h3>
                                    <span
                                        className={`text-xs ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}
                                    >
                    {formatTimestamp(conversation.updatedAt)}
                  </span>
                                </div>

                                <p
                                    className={`text-sm truncate ${
                                        hasUnread
                                            ? isDarkMode
                                                ? "text-white font-medium"
                                                : "text-gray-900 font-medium"
                                            : isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                    }`}
                                >
                                    {getMessagePreview(conversation)}
                                </p>

                                {conversation.product && (
                                    <div
                                        className={`mt-1 text-xs flex items-center ${
                                            isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}
                                    >
                                        <span>Re: {conversation.product.title}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationsList;