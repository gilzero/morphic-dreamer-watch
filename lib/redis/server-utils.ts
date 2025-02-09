/**
 * @fileoverview This file provides utility functions for managing
 * connections to both local and Upstash Redis instances. It includes
 * functions to obtain a Redis client and close existing connections.
 * 
 * @filepath lib/redis/server-utils.ts
 */
'use server';

import { Redis } from '@upstash/redis';
import { createClient, RedisClientType } from 'redis';
import { RedisConfig, RedisWrapper, redisConfig } from './config';

let localRedisClient: RedisClientType | null = null;
let redisWrapper: RedisWrapper | null = null;

/**
 * Retrieves a Redis client wrapped in a RedisWrapper instance. It
 * connects to either a local Redis instance or an Upstash Redis
 * instance based on the configuration.
 * 
 * @returns {Promise<RedisWrapper>} A promise that resolves to a
 * RedisWrapper instance.
 * @throws Will throw an error if the connection to Redis fails.
 */
export async function getRedisClientServer(): Promise<RedisWrapper> {
    if (redisWrapper) {
        return redisWrapper;
    }

    if (redisConfig.useLocalRedis) {
        if (!localRedisClient) {
            const localRedisUrl =
                redisConfig.localRedisUrl || 'redis://localhost:6379';
            try {
                const { createClient } = await import('redis');
                localRedisClient = createClient({ url: localRedisUrl });
                await localRedisClient.connect();
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes('ECONNREFUSED')) {
                        console.error(
                            `Failed to connect to local Redis at ${localRedisUrl}: Connection refused. Is Redis running?`
                        );
                    } else if (error.message.includes('ETIMEDOUT')) {
                        console.error(
                            `Failed to connect to local Redis at ${localRedisUrl}: Connection timed out. Check your network or Redis server.`
                        );
                    } else if (error.message.includes('ENOTFOUND')) {
                        console.error(
                            `Failed to connect to local Redis at ${localRedisUrl}: Host not found. Check your Redis URL.`
                        );
                    } else {
                        console.error(
                            `Failed to connect to local Redis at ${localRedisUrl}:`,
                            error.message
                        );
                    }
                } else {
                    console.error(
                        `An unexpected error occurred while connecting to local Redis at ${localRedisUrl}:`,
                        error
                    );
                }
                throw new Error(
                    'Failed to connect to local Redis. Check your configuration and ensure Redis is running.'
                );
            }
        }
        redisWrapper = new RedisWrapper(localRedisClient);
    } else {
        if (
            !redisConfig.upstashRedisRestUrl ||
            !redisConfig.upstashRedisRestToken
        ) {
            throw new Error(
                'Upstash Redis configuration is missing. Please check your environment variables.'
            );
        }
        try {
            redisWrapper = new RedisWrapper(
                new Redis({
                    url: redisConfig.upstashRedisRestUrl,
                    token: redisConfig.upstashRedisRestToken,
                })
            );
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('unauthorized')) {
                    console.error(
                        'Failed to connect to Upstash Redis: Unauthorized. Check your Upstash Redis token.'
                    );
                } else if (error.message.includes('not found')) {
                    console.error(
                        'Failed to connect to Upstash Redis: URL not found. Check your Upstash Redis URL.'
                    );
                } else {
                    console.error('Failed to connect to Upstash Redis:', error.message);
                }
            } else {
                console.error(
                    'An unexpected error occurred while connecting to Upstash Redis:',
                    error
                );
            }
            throw new Error(
                'Failed to connect to Upstash Redis. Check your configuration and credentials.'
            );
        }
    }

    return redisWrapper;
}

/**
 * Closes the existing Redis connections, both local and Upstash,
 * if they are open.
 * 
 * @returns {Promise<void>} A promise that resolves when the
 * connections are closed.
 */
export async function closeRedisConnectionServer(): Promise<void> {
    if (redisWrapper) {
        await redisWrapper.close();
        redisWrapper = null;
    }
    if (localRedisClient) {
        await localRedisClient.quit();
        localRedisClient = null;
    }
}