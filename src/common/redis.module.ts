import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',

      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URI');

        if (!redisUrl) {
          throw new Error('REDIS_URL is not defined');
        }

        const client = createClient({
          url: redisUrl,
        });

        client.on('error', (error) => {
          console.error('Redis Error:', error);
        });

        client.on('connect', () => {
          console.log('Redis connecting...');
        });

        client.on('ready', () => {
          console.log('Redis Ready');
        });

        client.on('end', () => {
          console.log('Redis Connection Closed ❌');
        });

        await client.connect();

        console.log('Redis Connected Successfully ✅');

        return client;
      },
    },
  ],

  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}