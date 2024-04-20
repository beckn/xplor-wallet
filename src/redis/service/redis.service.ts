import { Inject, Injectable, NotFoundException } from '@nestjs/common'
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
      // console.error('Redis connection error:', error)
    })
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

  async updateField(key: string, fieldName: string, newValue: any): Promise<void> {
    const jsonValue = await this.redisClient.get(key)
    if (!jsonValue) {
      throw new NotFoundException(`Key ${key} not found in Redis`)
    }

    // Parse the JSON into a JavaScript object
    const parsedValue = JSON.parse(jsonValue)

    parsedValue[fieldName] = newValue

    const updatedJsonValue = JSON.stringify(parsedValue)
    // Set the updated JSON value back into Redis
    await this.redisClient.set(key, updatedJsonValue)
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
