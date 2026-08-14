import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enum';

export const RoleName = 'roles';

export const Roles = (
  roles: RoleEnum[] = [],
) => {
  return SetMetadata(
    RoleName,
    roles,
  );
};