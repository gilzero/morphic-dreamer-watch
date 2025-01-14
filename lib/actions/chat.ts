/**
 * @fileoverview This file contains server actions for managing chat data,
 * including fetching, saving, clearing, and sharing chats using Redis.
 * @filepath lib/actions/chat.ts
 */
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type Chat } from '@/lib/types';
import { RedisWrapper } from '@/lib/redis/config';
import { getRedisClientServer } from '@/lib/redis/server-utils';

/**
 * Retrieves a Redis client instance.
 * @returns {Promise<RedisWrapper>} A promise that resolves to a Redis client.
 */
async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClientServer();
}

/**
 * Parses chat messages, handling stringified messages and date formats.
 * @param {any} chat The chat object to parse.
 * @returns {Chat} The parsed chat object.
 */
function parseChatMessages(chat: any): Chat {
  const plainChat = { ...chat };
  if (typeof plainChat.messages === 'string') {
    try {
      plainChat.messages = JSON.parse(plainChat.messages);
    } catch (error) {
      plainChat.messages = [];
    }
  }
  if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
    plainChat.createdAt = new Date(plainChat.createdAt);
  }
  return plainChat as Chat;
}

/**
 * Retrieves all chats for a given user ID.
 * @param {string | null} userId The ID of the user.
 * @returns {Promise<Chat[]>} A promise that resolves to an array of chats.
 */
export async function getChats(userId?: string | null): Promise<Chat[]> {
  if (!userId) {
    return [];
  }

  try {
    const redis = await getRedis();
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true,
    });

    if (chats.length === 0) {
      return [];
    }

    const results = await Promise.all(
      chats.map(async (chatKey) => {
        const chat = await redis.hgetall(chatKey);
        return chat;
      })
    );

    return results
      .filter((result): result is Record<string, any> => {
        if (result === null || Object.keys(result).length === 0) {
          return false;
        }
        return true;
      })
      .map(parseChatMessages);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
}

/**
 * Retrieves a single chat by its ID.
 * @param {string} id The ID of the chat.
 * @param {string} userId The ID of the user (default: 'anonymous').
 * @returns {Promise<Chat | null>} A promise that resolves to the chat or null.
 */
export async function getChat(
  id: string,
  userId: string = 'anonymous'
): Promise<Chat | null> {
  try {
    const redis = await getRedis();
    const chat = await redis.hgetall<Chat>(`chat:${id}`);

    if (!chat) {
      return null;
    }

    return parseChatMessages(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return null;
  }
}

/**
 * Clears all chats for a given user ID.
 * @param {string} userId The ID of the user (default: 'anonymous').
 * @returns {Promise<{ error?: string }>} A promise that resolves to an
 * object with an error message or an empty object on success.
 */
export async function clearChats(
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  try {
    const redis = await getRedis();
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1);
    if (!chats.length) {
      return { error: 'No chats to clear' };
    }
    const pipeline = redis.pipeline();

    for (const chat of chats) {
      pipeline.del(chat);
      pipeline.zrem(`user:chat:${userId}`, chat);
    }

    await pipeline.exec();

    revalidatePath('/');
    redirect('/');
    return {};
  } catch (error) {
    console.error('Error clearing chats:', error);
    return { error: 'Failed to clear chats' };
  }
}

/**
 * Saves a chat to Redis.
 * @param {Chat} chat The chat object to save.
 * @param {string} userId The ID of the user (default: 'anonymous').
 * @returns {Promise<any>} A promise that resolves to the result of the
 * Redis pipeline execution.
 */
export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  try {
    const redis = await getRedis();
    const pipeline = redis.pipeline();

    const chatToSave = {
      ...chat,
      messages: JSON.stringify(chat.messages),
    };

    pipeline.hmset(`chat:${chat.id}`, chatToSave);
    pipeline.zadd(`user:chat:${userId}`, Date.now(), `chat:${chat.id}`);

    const results = await pipeline.exec();

    return results;
  } catch (error) {
    console.error('Error saving chat:', error);
    throw new Error('Failed to save chat');
  }
}

/**
 * Retrieves a shared chat by its ID.
 * @param {string} id The ID of the chat.
 * @returns {Promise<Chat | null>} A promise that resolves to the shared
 * chat or null if not found or not shared.
 */
export async function getSharedChat(id: string): Promise<Chat | null> {
  try {
    const redis = await getRedis();
    const chat = await redis.hgetall<Chat>(`chat:${id}`);

    if (!chat || !chat.sharePath) {
      return null;
    }

    return parseChatMessages(chat);
  } catch (error) {
    console.error('Error fetching shared chat:', error);
    return null;
  }
}

/**
 * Shares a chat by adding a share path to it.
 * @param {string} id The ID of the chat.
 * @param {string} userId The ID of the user (default: 'anonymous').
 * @returns {Promise<Chat | null>} A promise that resolves to the updated
 * chat object or null if the chat is not found or does not belong to the user.
 */
export async function shareChat(
  id: string,
  userId: string = 'anonymous'
): Promise<Chat | null> {
  try {
    const redis = await getRedis();
    const chat = await redis.hgetall<Chat>(`chat:${id}`);

    if (!chat || chat.userId !== userId) {
      return null;
    }

    const payload = {
      ...chat,
      sharePath: `/share/${id}`,
    };

    await redis.hmset(`chat:${id}`, payload);

    return payload;
  } catch (error) {
    console.error('Error sharing chat:', error);
    return null;
  }
}