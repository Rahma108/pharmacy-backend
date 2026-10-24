
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { InvoicesService } from './invoices.service';
import { Auth, User } from 'src/common/decorator';
import { RoleEnum } from 'src/common/enum';

interface AuthenticatedUser {
  id: number;
  role: RoleEnum;
}

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoiceService: InvoicesService,
  ) {}

  @Get()
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findAll(@User() user: AuthenticatedUser) {
    return this.invoiceService.findAll(user);
  }

  @Get(':id')
  @Auth([
    RoleEnum.ADMIN,
    RoleEnum.PHARMACIST,
    RoleEnum.EMPLOYEE,
  ])
  findById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthenticatedUser,
  ) {
    return this.invoiceService.findById(id, user);
  }
}
