import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto, OrderFilterDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculate delivery fee based on weight and delivery template
     * Formula: Base Price + ((Total Weight - 1) * Extra Price)
     */
    async calculateDeliveryFee(
        deliveryTemplateId: string,
        totalWeight: number,
    ): Promise<number> {
        const template = await this.prisma.deliveryTemplate.findUnique({
            where: { id: deliveryTemplateId },
        });

        if (!template) {
            throw new NotFoundException('Delivery template not found');
        }

        if (totalWeight <= 0) {
            throw new BadRequestException('Weight must be greater than 0');
        }

        const firstKg = Number(template.firstKgPrice);
        const extraKg = Number(template.extraKgPrice);

        // If weight is 1kg or less, return base price
        if (totalWeight <= 1) {
            return firstKg;
        }

        // Calculate: Base + ((Weight - 1) * Extra)
        const deliveryFee = firstKg + (totalWeight - 1) * extraKg;
        return Math.round(deliveryFee * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Create a new order with automatic delivery fee calculation
     */
    async create(tenantId: string, createOrderDto: CreateOrderDto) {
        const { customerId, items, deliveryTemplateId, totalWeight, discount, paymentMethod, orderSource } = createOrderDto;

        // Verify customer belongs to tenant
        const customer = await this.prisma.customer.findFirst({
            where: { id: customerId, tenantId },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // Calculate subtotal from items
        let subtotal = new Decimal(0);
        const orderItems = [];

        for (const item of items) {
            const product = await this.prisma.product.findFirst({
                where: { id: item.productId, tenantId },
            });

            if (!product) {
                throw new NotFoundException(`Product ${item.productId} not found`);
            }

            if (product.stock < item.quantity) {
                throw new BadRequestException(
                    `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                );
            }

            const itemTotal = new Decimal(product.price).mul(item.quantity);
            subtotal = subtotal.add(itemTotal);

            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // Calculate delivery fee
        let deliveryFee = 0;
        if (deliveryTemplateId && totalWeight) {
            deliveryFee = await this.calculateDeliveryFee(deliveryTemplateId, totalWeight);
        }

        // Calculate total: Subtotal - Discount + Delivery Fee
        const totalAmount = subtotal
            .sub(discount || 0)
            .add(deliveryFee);

        // Create order with items in a transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    customerId,
                    tenantId,
                    totalAmount,
                    discount: discount || 0,
                    deliveryFee,
                    deliveryTemplateId,
                    paymentMethod,
                    orderSource,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    customer: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    deliveryTemplate: true,
                },
            });

            // Reduce stock for each item
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                // Log inventory change
                await tx.inventoryHistory.create({
                    data: {
                        productId: item.productId,
                        change: -item.quantity,
                        reason: `Order #${newOrder.orderNumber}`,
                    },
                });
            }

            return newOrder;
        });

        return order;
    }

    /**
     * Get all orders for a tenant with filters
     */
    async findAll(tenantId: string, filters?: OrderFilterDto) {
        const where: any = { tenantId };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.orderSource) {
            where.orderSource = filters.orderSource;
        }

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt.lte = new Date(filters.endDate);
            }
        }

        return this.prisma.order.findMany({
            where,
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                deliveryTemplate: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get a single order by ID
     */
    async findOne(tenantId: string, id: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, tenantId },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                deliveryTemplate: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    /**
     * Update order status
     */
    async update(tenantId: string, id: string, updateOrderDto: UpdateOrderDto) {
        const order = await this.findOne(tenantId, id);

        return this.prisma.order.update({
            where: { id: order.id },
            data: updateOrderDto,
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                deliveryTemplate: true,
            },
        });
    }

    /**
     * Get orders ready for dispatch (status: READY)
     */
    async getReadyForDispatch(tenantId: string) {
        return this.prisma.order.findMany({
            where: {
                tenantId,
                status: 'READY',
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                deliveryTemplate: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    /**
     * Export orders to CSV format for courier bulk upload
     */
    async exportForCourier(tenantId: string, orderIds: string[]) {
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                id: { in: orderIds },
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Format for courier CSV
        return orders.map((order) => ({
            orderNumber: order.orderNumber,
            customerName: order.customer.name,
            phone: order.customer.phone,
            address: order.customer.address,
            city: order.customer.city,
            totalAmount: Number(order.totalAmount),
            deliveryFee: Number(order.deliveryFee),
            paymentMethod: order.paymentMethod,
            items: order.items
                .map((item) => `${item.product.name} x${item.quantity}`)
                .join(', '),
        }));
    }
}
