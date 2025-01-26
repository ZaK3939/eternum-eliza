"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

import { Message, useChat as useAiChat } from 'ai/react';
import { Models } from '@/types/models';
import { usePrivy } from '@privy-io/react-auth';
import { generateId } from 'ai';
import { useUserChats } from '@/hooks';

export enum ColorMode {
    LIGHT = 'light',
    DARK = 'dark',
}

// Define a type for tool results
type ToolResult = {
    message: string;
    body?: Record<string, unknown>;
}

interface ChatContextType {
    messages: Message[];
    input: string;
    setInput: (input: string) => void;
    onSubmit: () => Promise<void>;
    isLoading: boolean;
    sendMessage: (message: string) => void;
    addToolResult: (toolCallId: string, result: ToolResult) => void;
    isResponseLoading: boolean;
    model: Models;
    setModel: (model: Models) => void;
    setChat: (chatId: string) => void;
    resetChat: () => void;
    chatId: string;
}

const ChatContext = createContext<ChatContextType>({
    messages: [],
    input: '',
    setInput: () => {},
    onSubmit: async () => {},
    isLoading: false,
    sendMessage: () => {},
    isResponseLoading: false,
    addToolResult: () => {},
    model: Models.OpenAI,
    setModel: () => {},
    setChat: () => {},
    resetChat: () => {},
    chatId: '',
});

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {

    const { user, getAccessToken } = usePrivy();

    const [chatId, setChatId] = useState<string>(generateId());
    const [isResponseLoading, setIsResponseLoading] = useState(false);
    const [model, setModel] = useState<Models>(Models.OpenAI);

    const { mutate } = useUserChats();

    const setChat = async (chatId: string) => {
        setChatId(chatId);
        const chat = await fetch(`/api/chats/${chatId}`, {
            headers: {
                Authorization: `Bearer ${await getAccessToken()}`,
            },
        });
        const chatData = await chat.json();
        if (chatData) {
            setMessages(chatData.messages);
        }
    }

    const resetChat = () => {
        setChatId(generateId());
        setMessages([]);
    }

    const { messages, input, setInput, append, isLoading, addToolResult, setMessages } = useAiChat({
        maxSteps: 20,
        onResponse: () => {
            setIsResponseLoading(false);
        },
        api: '/api/chat/solana',
        body: {
            model,
            modelName: model,
            userId: user?.id,
            chatId,
        },
    });

    useEffect(() => {
        const updateChat = async () => {
            if(messages.length > 0 && !isLoading) {
                const response = await fetch(`/api/chats/${chatId}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${await getAccessToken()}`,
                    },
                    body: JSON.stringify({
                        messages,
                    }),
                });
                const data = await response.json();
                if(typeof data === 'object') {
                    mutate();
                }
            }
        };

        updateChat();
    }, [isLoading]);

    const onSubmit = async () => {
        if (!input.trim()) return;
        setIsResponseLoading(true);
        await append({
            role: 'user',
            content: input,
        });
        setInput('');
    }

    const sendMessage = async (message: string) => {
        setIsResponseLoading(true);
        await append({
            role: 'user',
            content: message,
        });
    }

    return (
        <ChatContext.Provider value={{ 
            messages, 
            input, 
            setInput, 
            onSubmit, 
            isLoading,
            sendMessage,
            isResponseLoading,
            addToolResult: (toolCallId: string, result: ToolResult) => addToolResult({
                toolCallId,
                result,
            }),
            model,
            setModel,
            setChat,
            resetChat,
            chatId,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);