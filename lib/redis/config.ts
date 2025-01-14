/**
 * @fileoverview This file contains the configuration and wrapper classes
 * for interacting with both local and Upstash Redis instances. It provides
 * a unified interface for Redis operations, including support for pipelining.
 * The configuration is determined based on environment variables.
 * 
 * @filepath lib/redis/config.ts
 */

import { Redis } from '@upstash/redis';
import { createClient, RedisClientType } from 'redis';

export type RedisConfig = {
  useLocalRedis: boolean;
  upstashRedisRestUrl?: string;
  upstashRedisRestToken?: string;
  localRedisUrl?: string;
};

export const redisConfig: RedisConfig = {
  useLocalRedis: process.env.USE_LOCAL_REDIS === 'true',
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  localRedisUrl: process.env.LOCAL_REDIS_URL || 'redis://localhost:6379',
};

let localRedisClient: RedisClientType | null = null;
let redisWrapper: RedisWrapper | null = null;

/**
 * Wrapper class for Redis client
 */
export class RedisWrapper {
  private client: Redis | RedisClientType;

  /**
   * @param {Redis | RedisClientType} client - The Redis client instance
   */
  constructor(client: Redis | RedisClientType) {
    this.client = client;
  }

  /**
   * Retrieves a range of elements from a sorted set.
   * @param {string} key - The key of the sorted set.
   * @param {number} start - The start index.
   * @param {number} stop - The stop index.
   * @param {Object} [options] - Optional parameters.
   * @param {boolean} [options.rev] - Whether to reverse the range.
   * @returns {Promise<string[]>} - The range of elements.
   */
  async zrange(
      key: string,
      start: number,
      stop: number,
      options?: { rev: boolean }
  ): Promise<string[]> {
    let result: string[];
    if (this.client instanceof Redis) {
      result = await this.client.zrange(key, start, stop, options);
    } else {
      const redisClient = this.client as RedisClientType;
      if (options?.rev) {
        result = await redisClient.zRange(key, start, stop, { REV: true });
      } else {
        result = await redisClient.zRange(key, start, stop);
      }
    }
    return result;
  }

  /**
   * Retrieves all fields and values of a hash.
   * @param {string} key - The key of the hash.
   * @returns {Promise<T | null>} - The hash fields and values.
   */
  async hgetall<T extends Record<string, unknown>>(
      key: string
  ): Promise<T | null> {
    if (this.client instanceof Redis) {
      return this.client.hgetall(key) as Promise<T | null>;
    } else {
      const result = await (this.client as RedisClientType).hGetAll(key);
      return Object.keys(result).length > 0 ? (result as T) : null;
    }
  }

  /**
   * Creates a pipeline for executing multiple commands.
   * @returns {UpstashPipelineWrapper | LocalPipelineWrapper} - The pipeline.
   */
  pipeline() {
    return this.client instanceof Redis
        ? new UpstashPipelineWrapper(this.client.pipeline())
        : new LocalPipelineWrapper((this.client as RedisClientType).multi());
  }

  /**
   * Sets multiple fields in a hash.
   * @param {string} key - The key of the hash.
   * @param {Record<string, any>} value - The fields and values to set.
   * @returns {Promise<'OK' | number>} - The result of the operation.
   */
  async hmset(key: string, value: Record<string, any>): Promise<'OK' | number> {
    if (this.client instanceof Redis) {
      return this.client.hmset(key, value);
    } else {
      return (this.client as RedisClientType).hSet(key, value);
    }
  }

  /**
   * Adds a member to a sorted set.
   * @param {string} key - The key of the sorted set.
   * @param {number} score - The score of the member.
   * @param {string} member - The member to add.
   * @returns {Promise<number | null>} - The result of the operation.
   */
  async zadd(
      key: string,
      score: number,
      member: string
  ): Promise<number | null> {
    if (this.client instanceof Redis) {
      return this.client.zadd(key, { score, member });
    } else {
      return (this.client as RedisClientType).zAdd(key, {
        score,
        value: member,
      });
    }
  }

  /**
   * Deletes a key.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} - The result of the operation.
   */
  async del(key: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.del(key);
    } else {
      return (this.client as RedisClientType).del(key);
    }
  }

  /**
   * Removes a member from a sorted set.
   * @param {string} key - The key of the sorted set.
   * @param {string} member - The member to remove.
   * @returns {Promise<number>} - The result of the operation.
   */
  async zrem(key: string, member: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.zrem(key, member);
    } else {
      return (this.client as RedisClientType).zRem(key, member);
    }
  }

  /**
   * Closes the Redis connection.
   * @returns {Promise<void>} - A promise that resolves when the connection is closed.
   */
  async close(): Promise<void> {
    if (this.client instanceof Redis) {
      // Upstash Redis doesn't require explicit closing
      return;
    } else {
      await (this.client as RedisClientType).quit();
    }
  }
}

/**
 * Wrapper class for Upstash Redis pipeline
 */
class UpstashPipelineWrapper {
  private pipeline: ReturnType<Redis['pipeline']>;

  /**
   * @param {ReturnType<Redis['pipeline']>} pipeline - The Upstash pipeline instance
   */
  constructor(pipeline: ReturnType<Redis['pipeline']>) {
    this.pipeline = pipeline;
  }

  /**
   * Adds an hgetall command to the pipeline.
   * @param {string} key - The key of the hash.
   * @returns {UpstashPipelineWrapper} - The pipeline instance.
   */
  hgetall(key: string) {
    this.pipeline.hgetall(key);
    return this;
  }

  /**
   * Adds a del command to the pipeline.
   * @param {string} key - The key to delete.
   * @returns {UpstashPipelineWrapper} - The pipeline instance.
   */
  del(key: string) {
    this.pipeline.del(key);
    return this;
  }

  /**
   * Adds a zrem command to the pipeline.
   * @param {string} key - The key of the sorted set.
   * @param {string} member - The member to remove.
   * @returns {UpstashPipelineWrapper} - The pipeline instance.
   */
  zrem(key: string, member: string) {
    this.pipeline.zrem(key, member);
    return this;
  }

  /**
   * Adds an hmset command to the pipeline.
   * @param {string} key - The key of the hash.
   * @param {Record<string, any>} value - The fields and values to set.
   * @returns {UpstashPipelineWrapper} - The pipeline instance.
   */
  hmset(key: string, value: Record<string, any>) {
    this.pipeline.hmset(key, value);
    return this;
  }

  /**
   * Adds a zadd command to the pipeline.
   * @param {string} key - The key of the sorted set.
   * @param {number} score - The score of the member.
   * @param {string} member - The member to add.
   * @returns {UpstashPipelineWrapper} - The pipeline instance.
   */
  zadd(key: string, score: number, member: string) {
    this.pipeline.zadd(key, { score, member });
    return this;
  }

  /**
   * Executes the pipeline.
   * @returns {Promise<any[]>} - The results of the pipeline commands.
   * @throws {Error} - If an error occurs during execution.
   */
  async exec() {
    try {
      return await this.pipeline.exec();
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Wrapper class for local Redis pipeline
 */
class LocalPipelineWrapper {
  private pipeline: ReturnType<RedisClientType['multi']>;

  /**
   * @param {ReturnType<RedisClientType['multi']>} pipeline - The local pipeline instance
   */
  constructor(pipeline: ReturnType<RedisClientType['multi']>) {
    this.pipeline = pipeline;
  }

  /**
   * Adds an hgetall command to the pipeline.
   * @param {string} key - The key of the hash.
   * @returns {LocalPipelineWrapper} - The pipeline instance.
   */
  hgetall(key: string) {
    this.pipeline.hGetAll(key);
    return this;
  }

  /**
   * Adds a del command to the pipeline.
   * @param {string} key - The key to delete.
   * @returns {LocalPipelineWrapper} - The pipeline instance.
   */
  del(key: string) {
    this.pipeline.del(key);
    return this;
  }

  /**
   * Adds a zrem command to the pipeline.
   * @param {string} key - The key of the sorted set.
   * @param {string} member - The member to remove.
   * @returns {LocalPipelineWrapper} - The pipeline instance.
   */
  zrem(key: string, member: string) {
    this.pipeline.zRem(key, member);
    return this;
  }

  /**
   * Adds an hmset command to the pipeline.
   * @param {string} key - The key of the hash.
   * @param {Record<string, any>} value - The fields and values to set.
   * @returns {LocalPipelineWrapper} - The pipeline instance.
   */
  hmset(key: string, value: Record<string, any>) {
    // Convert all values to strings
    const stringValue = Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, String(v)])
    );
    this.pipeline.hSet(key, stringValue);
    return this;
  }

  /**
   * Adds a zadd command to the pipeline.
   * @param {string} key - The key of the sorted set.
   * @param {number} score - The score of the member.
   * @param {string} member - The member to add.
   * @returns {LocalPipelineWrapper} - The pipeline instance.
   */
  zadd(key: string, score: number, member: string) {
    this.pipeline.zAdd(key, { score, value: member });
    return this;
  }

  /**
   * Executes the pipeline.
   * @returns {Promise<any[]>} - The results of the pipeline commands.
   * @throws {Error} - If an error occurs during execution.
   */
  async exec() {
    try {
      return await this.pipeline.exec();
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Function to get a Redis client
 * @returns {Promise<RedisWrapper>} - The Redis client wrapper.
 * @throws {Error} - If the connection to Redis fails.
 */
export async function getRedisClient(): Promise<RedisWrapper> {
  if (redisWrapper) {
    return redisWrapper;
  }

  if (redisConfig.useLocalRedis) {
    if (!localRedisClient) {
      const localRedisUrl =
          redisConfig.localRedisUrl || 'redis://localhost:6379';
      try {
        // Dynamic import to load redis only on the server
        if (typeof window === 'undefined') {
          const { createClient } = await import('redis');
          localRedisClient = createClient({ url: localRedisUrl });
          await localRedisClient.connect();
        } else {
          throw new Error('Redis client can only be initialized on the server.');
        }
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
 * Function to close the Redis connection
 * @returns {Promise<void>} - A promise that resolves when the connection is closed.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisWrapper) {
    await redisWrapper.close();
    redisWrapper = null;
  }
  if (localRedisClient) {
    await localRedisClient.quit();
    localRedisClient = null;
  }
}