import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenTypeEnum } from '../enum/security.enum';
import { tokenTypeName } from '../decorator/token.decorator';
import { TokenService } from 'src/utils/service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType =
      this.reflector.getAllAndOverride<TokenTypeEnum>(
        tokenTypeName,
        [context.getHandler(), context.getClass()],
      ) ?? TokenTypeEnum.access;

    const request = context.switchToHttp().getRequest();

    const authorization = request.headers?.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid Authorization format',
      );
    }

    const credentials = await this.tokenService.decodeToken({
      token,
      tokenType,
    });

    request.credentials = credentials;

    return true;
  }
}