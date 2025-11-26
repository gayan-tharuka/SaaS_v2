import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        // Check if SKU already exists for this tenant
        const existing = await this.prisma.product.findUnique({
            where: {
                tenantId_sku: {
                    tenantId,
                    sku: data.sku,
                },
            },
        });

        if (existing) {
            throw new ConflictException('Product with this SKU already exists');
        }

        return this.prisma.product.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.product.findMany({
            where: { tenantId },
            include: {
                history: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                history: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(tenantId: string, id: string, data: any) {
        await this.findOne(tenantId, id);

        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async adjustStock(tenantId: string, id: string, change: number, reason: string) {
        const product = await this.findOne(tenantId, id);

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.product.update({
                where: { id },
                data: {
                    stock: {
                        increment: change,
                    },
                },
            });

            await tx.inventoryHistory.create({
                data: {
                    productId: id,
                    change,
                    reason,
                },
            });

            return updated;
        });
    }

    async getLowStock(tenantId: string, threshold: number = 10) {
        return this.prisma.product.findMany({
            where: {
                tenantId,
                stock: {
                    lte: threshold,
                },
            },
            orderBy: { stock: 'asc' },
        });
    }
}
