import {
  RedisModuleOptions,
  RedisModuleOptionsFactory
} from '@svtslv/nestjs-ioredis/dist/redis.interfaces'

import { REDIS_DB, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_USERNAME } from '@environments'

export class RedisService implements RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions {
    return {
      config: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD,
        db: REDIS_DB
      }
    }
  }
}
