import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { SecurityService } from 'src/utils/service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly securityService: SecurityService,
    private readonly userRepository: UserRepository,
  ) {}

    async create(data: CreateUserDto) {
    const existingUser =
      await this.userRepository.findByEmail(
        data.email,
      );

    if (existingUser) {
      throw new ConflictException(
        'Email already exists.',
      );
    }

    const hashedPassword =
      await this.securityService.generateHash({
        plaintext: data.password,
      });

    const user =
      await this.userRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        isVerified: true,
    });

    const { password, ...safeUser } = user;

        return {
        message: 'User created successfully ✅',
        data: safeUser,
        };
    }

//     async findAll(
//   page = 1,
//   limit = 10,
//   search?: string,
// ) {
//   console.log('SERVICE SEARCH:', search);

//   const cleanSearch = search?.trim();

//   const where = cleanSearch
//     ? {
//         OR: [
//           {
//             name: {
//               contains: cleanSearch,
//               mode: 'insensitive' as const,
//             },
//           },
//           {
//             email: {
//               contains: cleanSearch,
//               mode: 'insensitive' as const,
//             },
//           },
//         ],
//       }
//     : undefined;

//   console.log(
//     'WHERE:',
//     JSON.stringify(where, null, 2),
//   );

//   const result = await this.userRepository.paginate({
//     page,
//     limit,
//     where,
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });

//   return result;
// }


async findAll(
  page = 1,
  limit = 10,
  search?: string,
) {
  console.log('🔥 SERVICE SEARCH:', search);

  if (search?.trim()) {
    const users = await this.userRepository.searchUsers(
      search.trim(),
    );

    console.log('🔥 USERS FROM REPOSITORY:', users);
  console.log('🔥 USERS LENGTH:', users.length);
    return {
      data: users.slice(
        (page - 1) * limit,
        page * limit,
      ),
      meta: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    };
  }

  return this.userRepository.paginate({
    page,
    limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

    
}
