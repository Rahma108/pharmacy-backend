import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { compare, hash } from 'bcrypt';
import { HashEnum } from 'src/common/enum/security.enum';

@Injectable()
export class SecurityService {
  constructor(private config: ConfigService) {}

  async generateHash({
    plaintext,
    algorithm = HashEnum.Bcrypt,
  }: {
    plaintext: string;
    algorithm?: HashEnum;
  }): Promise<string> {
    let hashResult = '';

    const salt = parseInt(
        this.config.get<string>('SALT_ROUND') ?? '10',
        10,
      );

      if (isNaN(salt)) {
        throw new Error('Invalid SALT_ROUND in env');
      }

    switch (algorithm) {
      case HashEnum.Argon2:
        hashResult = await argon2.hash(plaintext);
        break;

      default:
        hashResult = await hash(plaintext, salt);
        break;
    }

    return hashResult;
  }

  async compareHash({
    plaintext,
    cipherText,
    algorithm = HashEnum.Bcrypt,
  }: {
    plaintext: string;
    cipherText: string;
    algorithm?: HashEnum;
  }): Promise<boolean> {
    let match = false;

    switch (algorithm) {
      case HashEnum.Argon2:
        match = await argon2.verify(cipherText, plaintext);
        break;

      default:
        match = await compare(plaintext, cipherText);
        break;
    }

    return match;
  }
}