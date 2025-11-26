import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('delivery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-templates')
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) { }

    @Post()
    create(@Request() req, @Body() createTemplateDto: any) {
        return this.deliveryService.create(req.user.tenantId, createTemplateDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.deliveryService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.deliveryService.findOne(req.user.tenantId, id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateTemplateDto: any) {
        return this.deliveryService.update(req.user.tenantId, id, updateTemplateDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.deliveryService.delete(req.user.tenantId, id);
    }
}
