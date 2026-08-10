import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from 'src/common/repository';

@Injectable()
export class UserRepository extends BaseRepository<
User,
number,
{
  name: string;
  email: string;
  password: string;
  role?: User['role'];
  isVerified?: boolean;
  refreshTokenHash?: string | null;
},
{
name?: string;
email?: string;
password?: string;
role?: User['role'];
isVerified?: boolean;
refreshTokenHash?: string | null;
}
>{
constructor(
private readonly prisma: PrismaService,
) {
super(prisma.user);
}

async findByEmail(
email: string,
): Promise<User | null> {
return this.prisma.user.findUnique({
where: {
email,
},
});
}
}