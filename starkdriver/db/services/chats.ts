import "server-only";

import { add, del, find, get, update } from "./base";

import { getChatsContainer } from "../containers";

import { Chat } from "../types";

import { PatchOperationType } from "@azure/cosmos";

import { Message } from "ai";

// CREATE

/**
 * **DATABASE SERVICE**
 * 
 * Adds a new chat to the database.
 * 
 * @param {Chat} chat - The chat data to be added.
 * @returns {Promise<Chat | null>} The newly created chat or null if creation failed.
 */
export const addChat = async (chat: Chat): Promise<Chat | null> => {
    return add<Chat, Chat>(await getChatsContainer(), chat);
};

// READ

/**
 * **DATABASE SERVICE**
 * 
 * Retrieves a chat by its ID and course ID.
 * 
 * @param {Chat["id"]} id - The ID of the chat to retrieve.
 * @param {Chat["userId"]} userId - The user ID associated with the chat.
 * @returns {Promise<Chat | null>} The retrieved chat or null if not found.
 */
export const getChat = async (id: Chat["id"], userId: Chat["userId"]): Promise<Chat | null> => {
    return get(await getChatsContainer(), id, userId);
};

/**
 * **DATABASE SERVICE**
 * 
 * Finds all chats for a user.
 * 
 * @param {Chat["userId"]} userId - The user ID to search for.
 * @returns {Promise<Chat[]>} An array of chats matching the criteria.
 */
export const findChatsByUser = async (userId: Chat["userId"]): Promise<Chat[]> => {
    return find(
        await getChatsContainer(), 
        `SELECT * FROM c WHERE c.userId = @userId ORDER BY c._ts DESC`, 
        [{ name: "@userId", value: userId }]
    );
};

// UPDATE

/**
 * **DATABASE SERVICE**
 * 
 * Updates a chat's tagline.
 * 
 * @param {Chat["id"]} id - The ID of the chat to update.
 * @param {Chat["userId"]} userId - The user ID associated with the chat.
 * @param {string} tagline - The new tagline for the chat.
 * @returns {Promise<boolean>} True if the update was successful, false otherwise.
 */
export const updateChatTagline = async (id: Chat["id"], userId: Chat["userId"], tagline: string): Promise<boolean> => {
    return update(
        await getChatsContainer(),
        id,
        userId,
        [{ op: PatchOperationType.add, path: "/tagline", value: tagline }]
    );
};


/**
 * **DATABASE SERVICE**
 * 
 * Adds a new message to an existing chat.
 * 
 * @param {Chat["id"]} id - The ID of the chat to update.
 * @param {Chat["userId"]} userId - The user ID associated with the chat.
 * @param {ChatMessage} message - The message to be added to the chat.
 * @returns {Promise<boolean>} True if the update was successful, false otherwise.
 */
export const addMessageToChat = async (id: Chat["id"], userId: Chat["userId"], message: Message): Promise<boolean> => {
    return update(
        await getChatsContainer(),
        id,
        userId,
        [{ op: PatchOperationType.add, path: "/messages/-", value: message }]
    );
};

/**
 * **DATABASE SERVICE**
 * 
 * Updates a chat's messages.
 * 
 * @param {Chat["id"]} id - The ID of the chat to update.
 * @param {Chat["userId"]} userId - The user ID associated with the chat.
 * @param {Message[]} messages - The new messages.
 * @returns {Promise<boolean>} True if the update was successful, false otherwise.
 */
export const updateChatMessages = async (id: Chat["id"], userId: Chat["userId"], messages: Message[]): Promise<boolean> => {
    return update(await getChatsContainer(), id, userId, [{ op: PatchOperationType.set, path: `/messages`, value: messages }]);
};

// DELETE

/**
 * **DATABASE SERVICE**
 * 
 * Deletes a chat from the database.
 * 
 * @param {Chat["id"]} id - The ID of the chat to delete.
 * @param {Chat["userId"]} userId - The user ID associated with the chat.
 * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
 */
export const deleteChat = async (id: Chat["id"], userId: Chat["userId"]): Promise<boolean> => {
    return del(await getChatsContainer(), id, userId);
};