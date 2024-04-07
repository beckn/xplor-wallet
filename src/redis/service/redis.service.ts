import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Listen for 'connect' event
    this.redisClient.on('connect', () => {
      console.log('Connected to Redis')
    })

    // Listen for 'error' event
    this.redisClient.on('error', (error) => {
      console.error('Redis connection error:', error)
    })

    // Listen for other events as needed
  }

  async setValue(key: string, value: any): Promise<any> {
    return await this.redisClient.set(key, value)
  }

  async getValue(key: string): Promise<any> {
    const value = await this.redisClient.get(key)
    if (value) {
      return JSON.parse(value)
    } else {
      return null
    }
  }

  async deleteKey(key: string): Promise<number> {
    return await this.redisClient.del(key)
  }

  async existsKey(key: string): Promise<number> {
    return await this.redisClient.exists(key)
  }

  async expireKey(key: string, seconds: number): Promise<number> {
    return await this.redisClient.expire(key, seconds)
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern)
  }

  async setWithExpiry(key: string, value: any, seconds: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', seconds)
  }

  async increment(key: string): Promise<number> {
    return await this.redisClient.incr(key)
  }

  async decrement(key: string): Promise<number> {
    return await this.redisClient.decr(key)
  }
}
