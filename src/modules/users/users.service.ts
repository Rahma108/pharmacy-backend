import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SecurityService } from 'src/utils/service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';

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


   async findById(id: number) {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }

      const { password, ...safeUser } = user;

      return {
        message: 'User retrieved successfully ✅',
        data: safeUser,
      };
}

    async update(
          id: number,
          data: UpdateUserDto,
        ) {
          const user =
            await this.userRepository.findById(id);

          if (!user) {
            throw new NotFoundException(
              'User not found',
            );
          }

          if (
            data.email &&
            data.email !== user.email
          ) {
            const existingUser =
              await this.userRepository.findByEmail(
                data.email,
              );

            if (existingUser) {
              throw new ConflictException(
                'Email already exists',
              );
            }
          }

          const updatedUser =
            await this.userRepository.update(
              id,
              data,
            );

          const {
            password,
            ...safeUser
          } = updatedUser;

          return {
            message:
              'User updated successfully ✅',
            data: safeUser,
          };
}

   async delete(
    id: number,
    currentUserId: number,
  ) {
    if (id === currentUserId) {
      throw new ConflictException(
        'You cannot delete your own account.',
      );
    }

    const user =
      await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const deletedUser =
      await this.userRepository.hardDelete(id);

    const {
      password,
      ...safeUser
    } = deletedUser;

    return {
      message:
        'User deleted successfully ✅',
      data: safeUser,
    };
  }


  async deactivate(id: number) {
      const user =
        await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }

      const updatedUser =
        await this.userRepository.update(
          id,
          {
            isActive: false,
          },
        );

      const {
          password,
          ...safeUser
        } = updatedUser;

      return {
        message:
          'User deactivated successfully ✅',
        data: safeUser,
      };
}

    async activate(id: number) {
  const user =
    await this.userRepository.findById(id);

  if (!user) {
    throw new NotFoundException(
      'User not found',
    );
  }

  const updatedUser =
    await this.userRepository.update(
      id,
      {
        isActive: true,
      },
    );

  const {
      password,
      ...safeUser
    } = updatedUser;

  return {
    message:
      'User activated successfully ✅',
    data: safeUser,
  };
}
    
  }