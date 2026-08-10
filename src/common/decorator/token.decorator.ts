import { SetMetadata } from '@nestjs/common';
import { TokenTypeEnum } from '../enum/security.enum';

export const tokenTypeName = 'tokenType';

export const Token = (
  tokenType: TokenTypeEnum = TokenTypeEnum.access,
) => {
  return SetMetadata(tokenTypeName, tokenType);
};