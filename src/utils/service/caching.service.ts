import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

import { EmailEnum } from 'src/common/enum';

type BaseKeyType = {
email: string;
type?: EmailEnum;
};

type SetParams = {
key: string;
value: unknown;
ttl?: number;
};

type ExpireParams = {
key: string;
ttl: number;
};

@Injectable()
export class CacheService {
constructor(
@Inject('REDIS_CLIENT')
private readonly client: RedisClientType,
) {
this.handleEvents();
}

private handleEvents(): void {
this.client.on('connect', () => {
console.log('REDIS_DB CONNECTED SUCCESSFULLY ✔️');
});


this.client.on('ready', () => {
  console.log('REDIS_DB READY ✔️');
});

this.client.on('error', (error) => {
  console.error('REDIS_DB ERROR ❌', error);
});

this.client.on('end', () => {
  console.log('Redis connection closed ❌');
});

this.client.on('reconnecting', () => {
  console.log('Redis reconnecting 🔄');
});


}

async connectRedis(): Promise<void> {
try {
if (this.client.isOpen) {
return;
}


  await this.client.connect();
} catch (error) {
  console.error('FAILED TO CONNECT TO REDIS ❌', error);
  throw error;
}


}

async set({
key,
value,
ttl,
}: SetParams): Promise<string | null> {
try {
const data =
typeof value === 'string'
? value
: JSON.stringify(value);


  if (ttl !== undefined) {
    return await this.client.set(key, data, {
      EX: ttl,
    });
  }

  return await this.client.set(key, data);
} catch (error) {
  console.error('Redis SET operation failed ❌', error);
  return null;
}


}

public async get<T = unknown>(key: string): Promise<T | null> {
  try {
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as T;
    } catch {
      return data as T;
    }
  } catch (error) {
    console.log(`Fail in redis get Operations ${error}`);
    return null;
  }
}

async exists(key: string): Promise<number> {
try {
return await this.client.exists(key);
} catch (error) {
console.error('Redis EXISTS operation failed ❌', error);
return 0;
}
}

async deleteKeys(
keys: string | string[],
): Promise<number> {
try {
if (Array.isArray(keys) && keys.length === 0) {
return 0;
}


  if (typeof keys === 'string' && !keys) {
    return 0;
  }

  return await this.client.del(keys);
} catch (error) {
  console.error('Redis DELETE operation failed ❌', error);
  return 0;
}

}

async ttl(key: string): Promise<number> {
try {
return await this.client.ttl(key);
} catch (error) {
console.error('Redis TTL operation failed ❌', error);
return -1;
}
}

async expire({
key,
ttl,
}: ExpireParams): Promise<any> {
try {
return await this.client.expire(key, ttl);
} catch (error) {
console.error('Redis EXPIRE operation failed ❌', error);
return false;
}
}

async increment(key: string): Promise<number> {
try {
return await this.client.incr(key);
} catch (error) {
console.error(
'Redis INCREMENT operation failed ❌',
error,
);


  return 0;
}


}

async mGet(
keys: string[] = [],
): Promise<(string | null)[]> {
try {
if (!keys.length) {
return [];
}


  return await this.client.mGet(keys);
} catch (error) {
  console.error('Redis MGET operation failed ❌', error);
  return [];
}


}

async keys(prefix: string): Promise<string[]> {
try {
return await this.client.keys(`${prefix}*`);
} catch (error) {
console.error('Redis KEYS operation failed ❌', error);
return [];
}
}

async update({
key,
value,
ttl,
}: SetParams): Promise<string | null | 0> {
try {
const exists = await this.exists(key);

  if (!exists) {
    return 0;
  }

  return await this.set({
    key,
    value,
    ttl,
  });
} catch (error) {
  console.error('Redis UPDATE operation failed ❌', error);
  return null;
}

}

baseRevokeTokenKey(
userId: number | string,
): string {
return `RevokeToken::${userId}`;
}

revokeTokenKey({
userId,
jti,
}: {
userId: number | string;
jti: string;
}): string {
return `${this.baseRevokeTokenKey(userId)}::${jti}`;
}

otpKey({
email,
type = EmailEnum.confirmEmail,
}: BaseKeyType): string {
return `OTP:USER::${email}::${type}`;
}

otpMaxRequestKey({
email,
type = EmailEnum.confirmEmail,
}: BaseKeyType): string {
return `${this.otpKey({
      email,
      type,
    })}::Request`;
}

otpBlockKey({
email,
type = EmailEnum.confirmEmail,
}: BaseKeyType): string {
return `${this.otpKey({
      email,
      type,
    })}::Block::Request`;
}

userSessionKey(
userId: number | string,
): string {
return `UserSession::${userId}`;
}
}
