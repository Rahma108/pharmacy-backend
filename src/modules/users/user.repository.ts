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
  isActive?: boolean;
  refreshTokenHash?: string | null;
},
{
name?: string;
email?: string;
password?: string;
role?: User['role'];
isVerified?: boolean;
isActive?: boolean;
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
  console.log("Searching:", email);

  const user =
    await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  return user;
}
async searchUsers(search: string) {
  console.log(this.prisma.user);

  const users = await this.prisma.user.findMany({
 where: {
  OR: [
    {
      name: {
        equals: search,
      mode: 'insensitive',
      },
    },
    {
      email: {
        equals: search,
      mode: 'insensitive',
      },
    },
  ],
}
});

  console.log(users);

  return users;
}

}