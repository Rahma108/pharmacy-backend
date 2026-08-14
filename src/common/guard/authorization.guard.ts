import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { RoleEnum } from '../enum';

import { RoleName } from '../decorator/role.decorator';

@Injectable()
export class AuthorizationGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const roles =
      this.reflector.getAllAndOverride<
        RoleEnum[]
      >(RoleName, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!roles?.length) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user =
      request.credentials?.user;

    if (!user) {
      return false;
    }

    console.log('Allowed Roles:', roles);

    console.log(
      'User Role:',
      request.credentials?.user?.role,
    );

    return roles.includes(
      user.role as RoleEnum,
    );
  }
}