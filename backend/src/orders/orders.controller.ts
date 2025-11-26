import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderFilterDto, CalculateDeliveryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(req.user.tenantId, createOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders with optional filters' })
    findAll(@Request() req, @Query() filters: OrderFilterDto) {
        return this.ordersService.findAll(req.user.tenantId, filters);
    }

    @Get('ready-for-dispatch')
    @ApiOperation({ summary: 'Get orders ready for dispatch' })
    getReadyForDispatch(@Request() req) {
        return this.ordersService.getReadyForDispatch(req.user.tenantId);
    }

    @Post('calculate-delivery')
    @ApiOperation({ summary: 'Calculate delivery fee' })
    calculateDelivery(@Body() dto: CalculateDeliveryDto) {
        return this.ordersService.calculateDeliveryFee(
            dto.deliveryTemplateId,
            dto.totalWeight,
        );
    }

    @Post('export-courier')
    @ApiOperation({ summary: 'Export orders for courier bulk upload' })
    exportForCourier(@Request() req, @Body() body: { orderIds: string[] }) {
        return this.ordersService.exportForCourier(req.user.tenantId, body.orderIds);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    findOne(@Request() req, @Param('id') id: string) {
        return this.ordersService.findOne(req.user.tenantId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update order status' })
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto,
    ) {
        return this.ordersService.update(req.user.tenantId, id, updateOrderDto);
    }
}
