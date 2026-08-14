import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Search,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleEnum } from 'src/common/enum';
import { Auth } from 'src/common/decorator';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    @Post()
    @Auth([RoleEnum.ADMIN])
    create(
        @Body()
        data: CreateUserDto,
    ) {
        return this.usersService.create(
        data,
        );
    }


    @Get()
        @Auth([RoleEnum.ADMIN])
        findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search?: string,
        ) {
              console.log('🔥 CONTROLLER SEARCH:', search);
        return this.usersService.findAll(
            Number(page),
            Number(limit),
            search,
        );
        }
}