// Filepath: lib/actions/chat.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type Chat } from '@/lib/types';
import { RedisWrapper } from '@/lib/redis/config';
import { getRedisClientServer } from '@/lib/redis/server-utils';

async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClientServer();
}

export async function getChats(userId?: string | null) {
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
        .map((chat) => {
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
        });
  } catch (error) {
    console.error('Error fetching chats:', error);
    // Return an empty array or a more informative error object
    return [];
  }
}

export async function getChat(id: string, userId: string = 'anonymous') {
  try {
    const redis = await getRedis();
    const chat = await redis.hgetall<Chat>(`chat:${id}`);

    if (!chat) {
      return null;
    }

    // Parse the messages if they're stored as a string
    if (typeof chat.messages === 'string') {
      try {
        chat.messages = JSON.parse(chat.messages);
      } catch (error) {
        chat.messages = [];
      }
    }

    // Ensure messages is always an array
    if (!Array.isArray(chat.messages)) {
      chat.messages = [];
    }

    return chat;
  } catch (error) {
    console.error('Error fetching chat:', error);
    return null;
  }
}

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
    return {}; // Return an empty object on success
  } catch (error) {
    console.error('Error clearing chats:', error);
    return { error: 'Failed to clear chats' };
  }
}

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

export async function getSharedChat(id: string) {
  try {
    const redis = await getRedis();
    const chat = await redis.hgetall<Chat>(`chat:${id}`);

    if (!chat || !chat.sharePath) {
      return null;
    }

    return chat;
  } catch (error) {
    console.error('Error fetching shared chat:', error);
    return null;
  }
}

export async function shareChat(id: string, userId: string = 'anonymous') {
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