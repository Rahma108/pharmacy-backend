import {
BadRequestException,
Injectable,
UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

import { User } from '@prisma/client';

import { CacheService } from './caching.service';
import { UserRepository } from 'src/modules/users/user.repository';
import { RoleEnum, TokenTypeEnum } from 'src/common/enum';

@Injectable()
export class TokenService {
private readonly ACCESS_EXPIRES_IN: number;
private readonly REFRESH_EXPIRES_IN: number;

private readonly SYSTEM_REFRESH_TOKEN_SECURITY_KEY: string;
private readonly SYSTEM_TOKEN_SECURITY_KEY: string;

private readonly USER_REFRESH_TOKEN_SECURITY_KEY: string;
private readonly USER_TOKEN_SECURITY_KEY: string;

constructor(
private readonly jwtService: JwtService,
private readonly configService: ConfigService,
private readonly redisService: CacheService,
private readonly userRepository: UserRepository,
) {
this.ACCESS_EXPIRES_IN = Number(
  this.configService.get('ACCESS_EXPIRES_IN'),
);

this.REFRESH_EXPIRES_IN = Number(
  this.configService.get('REFRESH_EXPIRES_IN'),
);
this.SYSTEM_REFRESH_TOKEN_SECURITY_KEY =
  this.configService.get<string>(
    'SYSTEM_REFRESH_TOKEN_SECURITY_KEY',
  ) as string;

this.SYSTEM_TOKEN_SECURITY_KEY =
  this.configService.get<string>(
    'SYSTEM_TOKEN_SECURITY_KEY',
  ) as string;

this.USER_REFRESH_TOKEN_SECURITY_KEY =
  this.configService.get<string>(
    'USER_REFRESH_TOKEN_SECURITY_KEY',
  ) as string;

this.USER_TOKEN_SECURITY_KEY =
  this.configService.get<string>(
    'USER_TOKEN_SECURITY_KEY',
  ) as string;


}

// =========================
// Sign Token
// =========================

async sign({
payload,
secret = this.USER_TOKEN_SECURITY_KEY,
options,
}: {
payload: object;
secret?: string;
options?: SignOptions;
}): Promise<string> {
return this.jwtService.signAsync(payload, {
secret,
...options,
});
}

// =========================
// Verify Token
// =========================

async verify({
token,
secret = this.USER_TOKEN_SECURITY_KEY,
}: {
token: string;
secret?: string;
}): Promise<JwtPayload> {
return (await this.jwtService.verifyAsync(token, {
secret,
})) as JwtPayload;
}

// =========================
// Get Token Signature
// =========================

async getTokenSignature({
tokenType = TokenTypeEnum.access,
level,
}: {
tokenType?: TokenTypeEnum;
level: RoleEnum;
}): Promise<string> {
const {
accessSignature,
refreshSignature,
} = await this.getTokenSignatureLevel(level);


if (tokenType === TokenTypeEnum.refresh) {
  return refreshSignature;
}

return accessSignature;


}

// =========================
// Get Signature By Role
// =========================

async getTokenSignatureLevel(
level: RoleEnum,
): Promise<{
accessSignature: string;
refreshSignature: string;
}> {
if (level === RoleEnum.ADMIN) {
return {
accessSignature:
this.SYSTEM_TOKEN_SECURITY_KEY,


    refreshSignature:
      this.SYSTEM_REFRESH_TOKEN_SECURITY_KEY,
  };
}

return {
  accessSignature:
    this.USER_TOKEN_SECURITY_KEY,

  refreshSignature:
    this.USER_REFRESH_TOKEN_SECURITY_KEY,
};


}

// =========================
// Decode + Verify Token
// =========================

async decodeToken({
token,
tokenType = TokenTypeEnum.access,
}: {
token: string;
tokenType?: TokenTypeEnum;
}): Promise<{
user: User;
decoded: JwtPayload;
}> {
const decoded =
this.jwtService.decode(token) as JwtPayload | null;


if (!decoded) {
  throw new BadRequestException(
    'Invalid token',
  );
}

if (!decoded.aud) {
  throw new BadRequestException(
    'Token audience is required',
  );
}

if (!Array.isArray(decoded.aud)) {
  throw new BadRequestException(
    'Invalid audience format',
  );
}

const [tokenApproach, level] =
  decoded.aud;

if (
  tokenType !==
  (tokenApproach as TokenTypeEnum)
) {
  throw new BadRequestException(
    `Invalid token type: ${tokenType}`,
  );
}

const role = level as RoleEnum;

if (
  !Object.values(RoleEnum).includes(role)
) {
  throw new BadRequestException(
    'Invalid user role',
  );
}

// =========================
// Check Revoked Token
// =========================

if (decoded.jti && decoded.sub) {
  const revokeKey =
    this.redisService.revokeTokenKey({
      userId: decoded.sub,
      jti: decoded.jti,
    });

  const revoked =
    await this.redisService.get(
      revokeKey,
    );

  if (revoked) {
    throw new UnauthorizedException(
      'Invalid Login Session ❌',
    );
  }
}

// =========================
// Get Secret
// =========================

const secret =
  await this.getTokenSignature({
    tokenType:
      tokenApproach as TokenTypeEnum,
    level: role,
  });

// =========================
// Verify Token
// =========================

let verifiedData: JwtPayload;

try {
  verifiedData =
    await this.jwtService.verifyAsync(
      token,
      {
        secret,
      },
    );
} catch (error: any) {
  if (
    error?.name ===
    'TokenExpiredError'
  ) {
    throw new UnauthorizedException(
      'Token expired ❌',
    );
  }

  throw new UnauthorizedException(
    'Invalid token ❌',
  );
}

if (!verifiedData.sub) {
  throw new UnauthorizedException(
    'Invalid token subject ❌',
  );
}

// =========================
// Get User From Database
// =========================

const user =
  await this.userRepository.findById(
    Number(verifiedData.sub),
  );

if (!user) {
  throw new UnauthorizedException(
    'User is not registered ❌',
  );
}

return {
  user,
  decoded: verifiedData,
};


}

// =========================
// Create Login Credentials
// =========================

async createLoginCredentials(
user: User,
issuer: string,
): Promise<{
access_token: string;
refresh_token: string;
}> {
const role =
user.role as unknown as RoleEnum;


const {
  accessSignature,
  refreshSignature,
} =
  await this.getTokenSignatureLevel(
    role,
  );

const jwtId = randomUUID();

// =========================
// Access Token
// =========================

const access_token =
  await this.sign({
    payload: {
      sub: user.id.toString(),
    },

    secret: accessSignature,

    options: {
      issuer,

      audience: [
        TokenTypeEnum.access,
        role,
      ],

      expiresIn:
        this.ACCESS_EXPIRES_IN,

      jwtid: jwtId,
    },
  });

// =========================
// Refresh Token
// =========================

const refresh_token =
  await this.sign({
    payload: {
      sub: user.id.toString(),
    },

    secret: refreshSignature,

    options: {
      issuer,

      audience: [
        TokenTypeEnum.refresh,
        role,
      ],

      expiresIn:
        this.REFRESH_EXPIRES_IN,

      jwtid: jwtId,
    },
  });

return {
  access_token,
  refresh_token,
};


}
}
