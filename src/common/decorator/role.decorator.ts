import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enum';

export const RoleName = 'roles';

export const Role = (roles: RoleEnum[] = []) => {
  return SetMetadata(RoleName, roles);
};