// client/src/context/ChatContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import API_BASE_URL from "../config/api";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Initialize socket connection
    useEffect(() => {
        if (user?.token) {
            const newSocket = io(API_BASE_URL.replace("/api", ""), {
                auth: { token: user.token },
            });

            newSocket.on("connect", () => {
                console.log("Socket connected");
            });

            newSocket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user?.token]);

    // Load conversations
    useEffect(() => {
        const fetchConversations = async () => {
            if (!user?.token) return;

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setConversations(data);

                    // Calculate unread counts
                    const unreadCounts = {};
                    data.forEach(conv => {
                        if (!conv.isRead[user.userId]) {
                            unreadCounts[conv._id] = (unreadCounts[conv._id] || 0) + 1;
                        }
                    });
                    setUnreadMessages(unreadCounts);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user?.token, user?.userId]);

    // Handle incoming messages and notifications
    useEffect(() => {
        if (!socket) return;

        socket.on("receive_message", (message) => {
            // Update conversations with new message
            setConversations(prev => {
                return prev.map(conv => {
                    if (conv._id === message.conversation) {
                        return {
                            ...conv,
                            lastMessage: message,
                            updatedAt: message.createdAt
                        };
                    }
                    return conv;
                });
            });

            // Update unread counts if not in active conversation
            if (activeConversation !== message.conversation && message.sender._id !== user.userId) {
                setUnreadMessages(prev => ({
                    ...prev,
                    [message.conversation]: (prev[message.conversation] || 0) + 1
                }));
            }
        });

        socket.on("messages_read", ({ conversationId, userId }) => {
            // Update messages read status in UI
            if (userId !== user.userId) {
                // Update the UI to show read receipts
            }
        });

        return () => {
            socket.off("receive_message");
            socket.off("messages_read");
        };
    }, [socket, activeConversation, user?.userId]);

    // Create a new conversation
    const startConversation = async (participantId, productId, initialMessage) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    participantId,
                    productId,
                    initialMessage
                })
            });

            if (response.ok) {
                const newConversation = await response.json();
                setConversations(prev => [newConversation, ...prev]);
                return newConversation._id;
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            throw error;
        }
    };

    // Send a message
    const sendMessage = (conversationId, content, attachments = []) => {
        if (!socket) return;

        socket.emit("send_message", {
            conversationId,
            content,
            attachments
        });
    };

    // Mark messages as read
    const markConversationAsRead = (conversationId) => {
        if (!socket) return;

        socket.emit("mark_as_read", { conversationId });
        setUnreadMessages(prev => ({
            ...prev,
            [conversationId]: 0
        }));
    };

    const value = {
        socket,
        conversations,
        unreadMessages,
        loading,
        startConversation,
        sendMessage,
        markConversationAsRead,
        setActiveConversation,
        activeConversation
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};