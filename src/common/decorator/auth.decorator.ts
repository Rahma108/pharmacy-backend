import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guard/authentication.guard';
import { AuthorizationGuard } from '../guard/authorization.guard';
import { Roles } from './role.decorator';
import { Token } from './token.decorator';
import { RoleEnum, TokenTypeEnum } from '../enum';

export const Auth = (
  roles: RoleEnum[] = [],
  type: TokenTypeEnum = TokenTypeEnum.access,
) => {
  return applyDecorators(
            Token(type),
            Roles(roles),
            UseGuards(
            AuthenticationGuard,
            AuthorizationGuard,
            ),
        );
};