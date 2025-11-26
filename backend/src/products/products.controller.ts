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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Request() req, @Body() createProductDto: any) {
        return this.productsService.create(req.user.tenantId, createProductDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.productsService.findAll(req.user.tenantId);
    }

    @Get('low-stock')
    getLowStock(@Request() req, @Query('threshold') threshold?: string) {
        return this.productsService.getLowStock(
            req.user.tenantId,
            threshold ? parseInt(threshold) : 10,
        );
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.productsService.findOne(req.user.tenantId, id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateProductDto: any) {
        return this.productsService.update(req.user.tenantId, id, updateProductDto);
    }

    @Post(':id/adjust-stock')
    adjustStock(
        @Request() req,
        @Param('id') id: string,
        @Body() body: { change: number; reason: string },
    ) {
        return this.productsService.adjustStock(
            req.user.tenantId,
            id,
            body.change,
            body.reason,
        );
    }
}
