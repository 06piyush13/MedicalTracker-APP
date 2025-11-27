import React, { useState, useRef, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { GEMINI_API_KEY, GEMINI_API_URL } from "@/constants/api";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: number;
}

export function ChatWidget() {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            text: "Hello! I'm your medical assistant. How can I help you today?",
            sender: "bot",
            timestamp: Date.now(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOpen) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: "user",
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `You are a helpful and empathetic medical assistant. Provide concise and accurate health information. Always advise users to consult a doctor for serious concerns.
                                    
                                    Previous conversation:
                                    ${messages.map(m => `${m.sender}: ${m.text}`).join("\n")}
                                    
                                    User: ${userMessage.text}`
                                }
                            ]
                        }
                    ]
                }),
            });

            if (!response.ok) throw new Error(`API failed with status ${response.status}`);

            const data = await response.json();
            const botResponse = data.candidates[0].content.parts[0].text;

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: "bot",
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            let errorMessageText = "I'm having trouble connecting right now. Please try again later.";

            if (error instanceof Error) {
                if (error.message.includes("401")) {
                    errorMessageText = "Authentication failed. Please check the API key.";
                } else if (error.message.includes("429")) {
                    errorMessageText = "I'm receiving too many requests. Please try again in a moment.";
                } else if (error.message.includes("500")) {
                    errorMessageText = "The AI service is currently down. Please try again later.";
                }
            }

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: errorMessageText,
                sender: "bot",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === "user";
        return (
            <View
                style={[
                    styles.messageBubble,
                    isUser
                        ? {
                            backgroundColor: theme.primary,
                            alignSelf: "flex-end",
                            borderBottomRightRadius: 2,
                        }
                        : {
                            backgroundColor: theme.backgroundSecondary,
                            alignSelf: "flex-start",
                            borderBottomLeftRadius: 2,
                        },
                ]}
            >
                <ThemedText
                    style={[
                        Typography.body,
                        { color: isUser ? theme.buttonText : theme.text },
                    ]}
                >
                    {item.text}
                </ThemedText>
            </View>
        );
    };

    return (
        <>
            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.8}
            >
                <Feather name="message-circle" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Chat Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.chatContainer,
                            {
                                backgroundColor: theme.backgroundDefault,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: theme.border }]}>
                            <View style={styles.headerTitle}>
                                <Feather name="message-square" size={20} color={theme.primary} />
                                <ThemedText style={[Typography.h3, { marginLeft: Spacing.sm }]}>
                                    Medical Assistant
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Feather name="x" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Messages */}
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messageList}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                        />

                        {/* Input Area */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                        >
                            <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: theme.backgroundSecondary,
                                            color: theme.text,
                                        },
                                    ]}
                                    placeholder="Type a message..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    onSubmitEditing={handleSend}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 },
                                    ]}
                                    onPress={handleSend}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Feather name="send" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: Spacing["3xl"] + 50, // Above tab bar
        right: Spacing.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.lg,
    },
    chatContainer: {
        width: "100%",
        height: "80%",
        borderRadius: BorderRadius.lg,
        overflow: "hidden",
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        flexDirection: "row",
        alignItems: "center",
    },
    messageList: {
        padding: Spacing.md,
        gap: Spacing.md,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    inputContainer: {
        flexDirection: "row",
        padding: Spacing.md,
        borderTopWidth: 1,
        alignItems: "center",
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
});
