import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        // Check if phone already exists for this tenant
        const existing = await this.prisma.customer.findUnique({
            where: {
                tenantId_phone: {
                    tenantId,
                    phone: data.phone,
                },
            },
        });

        if (existing) {
            throw new ConflictException('Customer with this phone number already exists');
        }

        return this.prisma.customer.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.customer.findMany({
            where: { tenantId },
            include: {
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        return customer;
    }

    async findByPhone(tenantId: string, phone: string) {
        return this.prisma.customer.findUnique({
            where: {
                tenantId_phone: {
                    tenantId,
                    phone,
                },
            },
            include: {
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        await this.findOne(tenantId, id);

        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }
}
