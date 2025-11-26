import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@Request() req, @Body() createCustomerDto: any) {
        return this.customersService.create(req.user.tenantId, createCustomerDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.customersService.findAll(req.user.tenantId);
    }

    @Get('search')
    findByPhone(@Request() req, @Query('phone') phone: string) {
        return this.customersService.findByPhone(req.user.tenantId, phone);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.customersService.findOne(req.user.tenantId, id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateCustomerDto: any) {
        return this.customersService.update(req.user.tenantId, id, updateCustomerDto);
    }
}
