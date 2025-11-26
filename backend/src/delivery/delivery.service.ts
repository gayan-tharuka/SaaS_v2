import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        // If this is set as default, unset other defaults
        if (data.isDefault) {
            await this.prisma.deliveryTemplate.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.deliveryTemplate.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.deliveryTemplate.findMany({
            where: { tenantId },
            orderBy: { isDefault: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const template = await this.prisma.deliveryTemplate.findFirst({
            where: { id, tenantId },
        });

        if (!template) {
            throw new NotFoundException('Delivery template not found');
        }

        return template;
    }

    async update(tenantId: string, id: string, data: any) {
        await this.findOne(tenantId, id);

        // If this is set as default, unset other defaults
        if (data.isDefault) {
            await this.prisma.deliveryTemplate.updateMany({
                where: { tenantId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        return this.prisma.deliveryTemplate.update({
            where: { id },
            data,
        });
    }

    async delete(tenantId: string, id: string) {
        await this.findOne(tenantId, id);

        return this.prisma.deliveryTemplate.delete({
            where: { id },
        });
    }
}
