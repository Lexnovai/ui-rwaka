import Redis from 'ioredis'

// Use a global to avoid creating multiple Redis connections during Next.js hot reloads
const globalForRedis = global as unknown as { redis?: Redis }

const redisUrl = process.env.REDIS_URL || 'redis://host.docker.internal:6777'

export const redis: Redis =
  globalForRedis.redis ||
  new Redis(redisUrl, {
    // Safer defaults
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
  })

if (!globalForRedis.redis) {
  globalForRedis.redis = redis
  
  // Log Redis connection status
  redis.on('connect', () => {
    console.log('Redis connected successfully')
  })
  
  redis.on('error', (err) => {
    console.error('Redis connection error:', err)
  })
}

export async function incrementFreeUsage(userId: string): Promise<number> {
  const key = `free:usage:${userId}`
  const count = await redis.incr(key)
  return count
}

export async function getFreeUsage(userId: string): Promise<number> {
  const key = `free:usage:${userId}`
  const val = await redis.get(key)
  return val ? parseInt(val, 10) : 0
}
