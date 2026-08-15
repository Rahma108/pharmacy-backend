import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Search,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleEnum } from 'src/common/enum';
import { Auth } from 'src/common/decorator';
import { UpdateUserDto } from './dto/update-user-dto';
import { Credentials } from 'src/common/decorator/credentials.decorator';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
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
        return this.usersService.findAll(
            Number(page),
            Number(limit),
            search,
        );
        }

    @Get(':id')
        @Auth([RoleEnum.ADMIN])
        findById(
        @Param('id') id: string,
        ) {
        return this.usersService.findById(
            Number(id),
        );
}

    @Patch(':id')
        @Auth([RoleEnum.ADMIN])
        update(
        @Param('id') id: string,
        @Body() data: UpdateUserDto,
        ) {
        return this.usersService.update(
            Number(id),
            data,
  );
}

  

    @Delete(':id')
    @Auth([RoleEnum.ADMIN])
    delete(
    @Param('id') id: string,
    @Credentials() credentials: any,
    ) {
        console.log(credentials);
    return this.usersService.delete(
        Number(id),
        credentials.id,
    );
    }


    @Patch(':id/deactivate')
@Auth([RoleEnum.ADMIN])
deactivate(
  @Param('id') id: string,
) {
  return this.usersService.deactivate(
    Number(id),
  );
}

        @Patch(':id/activate')
                @Auth([RoleEnum.ADMIN])
                activate(
                @Param('id') id: string,
                ) {
                return this.usersService.activate(
                    Number(id),
                );
        }

    
}

