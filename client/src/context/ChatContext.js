// client/src/context/ChatContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import axios from "axios";
import API_BASE_URL from "../config/api";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Use refs to access latest state in socket callbacks
    const conversationsRef = useRef(conversations);
    const activeConversationRef = useRef(activeConversation);
    const unreadMessagesRef = useRef(unreadMessages);
    const userRef = useRef(user);

    // Update refs when state changes
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        unreadMessagesRef.current = unreadMessages;
    }, [unreadMessages]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Initialize socket connection
    useEffect(() => {
        if (!user?.token) return;

        // Close any existing socket
        if (socket) {
            console.log("Disconnecting previous socket");
            socket.disconnect();
        }

        const baseUrl = API_BASE_URL.replace("/api", "");
        console.log("Initializing socket connection to:", baseUrl);

        const newSocket = io(baseUrl, {
            auth: { token: user.token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        });

        newSocket.on("connect", () => {
            console.log("Socket connected with ID:", newSocket.id);

            // Set up event handlers after successful connection
            setupSocketEventHandlers(newSocket);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        setSocket(newSocket);

        return () => {
            console.log("Cleaning up socket connection");
            newSocket.off("receive_message");
            newSocket.off("new_message_notification");
            newSocket.off("messages_read");
            newSocket.disconnect();
        };
    }, [user?.token]); // Depends only on token

    // Setup socket event handlers
    const setupSocketEventHandlers = (socketInstance) => {
        // Handle new messages
        socketInstance.on("receive_message", (message) => {
            console.log("Message received via socket:", message);

            // Update conversations immediately
            setConversations(prevConversations => {
                // Find if the conversation exists
                const conversationIndex = prevConversations.findIndex(
                    c => c._id === message.conversation
                );

                if (conversationIndex >= 0) {
                    // Create a new array
                    const newConversations = [...prevConversations];

                    // Update the conversation with the new message
                    const updatedConversation = {
                        ...newConversations[conversationIndex],
                        lastMessage: message,
                        updatedAt: new Date().toISOString()
                    };

                    // Remove it from its current position
                    newConversations.splice(conversationIndex, 1);

                    // Add it to the beginning (newest first)
                    newConversations.unshift(updatedConversation);

                    return newConversations;
                }

                // If conversation not found, fetch all conversations
                fetchConversations();
                return prevConversations;
            });

            // Update unread counts if the message is not from the current user
            // and not in the active conversation
            if (message.sender._id !== userRef.current?.userId &&
                message.conversation !== activeConversationRef.current) {

                setUnreadMessages(prev => ({
                    ...prev,
                    [message.conversation]: (prev[message.conversation] || 0) + 1
                }));
            }
        });

        // Handle notification for new messages
        socketInstance.on("new_message_notification", (data) => {
            console.log("New message notification received:", data);

            // Refresh conversations to make sure we have the latest
            fetchConversations();

            // Update unread counts immediately
            if (data.message.sender._id !== userRef.current?.userId) {
                setUnreadMessages(prev => ({
                    ...prev,
                    [data.conversationId]: (prev[data.conversationId] || 0) + 1
                }));
            }
        });

        // Handle read receipts
        socketInstance.on("messages_read", ({ conversationId, userId }) => {
            console.log("Messages marked as read:", { conversationId, userId });
            if (userId === userRef.current?.userId) {
                setUnreadMessages(prev => ({
                    ...prev,
                    [conversationId]: 0
                }));
            }
        });
    };

    // Fetch conversations with explicit API call
    const fetchConversations = useCallback(async () => {
        if (!user?.token) return;

        try {
            console.log("Explicitly fetching conversations");
            setLoading(true);

            const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            console.log("Conversations fetched:", response.data);
            setConversations(response.data);

            // Calculate unread counts
            const unreadCounts = {};
            response.data.forEach(conv => {
                if (conv.isRead && !conv.isRead[user.userId]) {
                    unreadCounts[conv._id] = (unreadCounts[conv._id] || 0) + 1;
                }
            });

            setUnreadMessages(unreadCounts);

        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.token, user?.userId]);

    // Load conversations initially
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Create a new conversation
    const startConversation = async (participantId, productId, initialMessage) => {
        try {
            console.log("Starting new conversation with:", { participantId, productId });

            const response = await axios.post(
                `${API_BASE_URL}/chat/conversations`,
                {
                    participantId,
                    productId,
                    initialMessage
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            if (response.data) {
                console.log("New conversation created:", response.data);

                // Immediately update conversations list
                setConversations(prev => [response.data, ...prev]);

                // Also fetch to ensure we have the latest data
                fetchConversations();

                return response.data._id;
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            throw error;
        }
    };

    // Send a message
    const sendMessage = (conversationId, content, productId = null) => {
        if (!socket || !socket.connected) {
            console.error("Socket not connected, cannot send message");
            return false;
        }

        console.log("Sending message:", { conversationId, content, productId });
        socket.emit("send_message", {
            conversationId,
            content,
            productId
        });

        return true;
    };

    // Mark messages as read
    const markConversationAsRead = (conversationId) => {
        if (!socket || !socket.connected) {
            console.error("Socket not connected, cannot mark as read");
            return;
        }

        console.log("Marking conversation as read:", conversationId);
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
        activeConversation,
        fetchConversations
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