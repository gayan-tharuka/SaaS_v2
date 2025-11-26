import { IsString, IsNumber, IsArray, IsOptional, IsEnum, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty()
    @IsString()
    customerId: string;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    deliveryTemplateId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalWeight?: number;

    @ApiProperty({ required: false, default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;

    @ApiProperty()
    @IsString()
    paymentMethod: string;

    @ApiProperty()
    @IsString()
    orderSource: string;
}

export class UpdateOrderDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['PENDING', 'CONFIRMED', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'])
    status?: string;
}

export class OrderFilterDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['PENDING', 'CONFIRMED', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'])
    status?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    orderSource?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    endDate?: string;
}

export class CalculateDeliveryDto {
    @ApiProperty()
    @IsString()
    deliveryTemplateId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    totalWeight: number;
}
