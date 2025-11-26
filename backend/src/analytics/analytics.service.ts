import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getRevenue(tenantId: string, period: 'daily' | 'weekly' | 'monthly') {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'daily':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 12));
                break;
        }

        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                createdAt: {
                    gte: startDate,
                },
                status: {
                    notIn: ['CANCELLED'],
                },
            },
            select: {
                createdAt: true,
                totalAmount: true,
            },
        });

        // Group by date
        const grouped = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += Number(order.totalAmount);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([date, revenue]) => ({
            date,
            revenue,
        }));
    }

    async getOrderStats(tenantId: string) {
        const [total, pending, confirmed, ready, dispatched, delivered, cancelled] =
            await Promise.all([
                this.prisma.order.count({ where: { tenantId } }),
                this.prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
                this.prisma.order.count({ where: { tenantId, status: 'CONFIRMED' } }),
                this.prisma.order.count({ where: { tenantId, status: 'READY' } }),
                this.prisma.order.count({ where: { tenantId, status: 'DISPATCHED' } }),
                this.prisma.order.count({ where: { tenantId, status: 'DELIVERED' } }),
                this.prisma.order.count({ where: { tenantId, status: 'CANCELLED' } }),
            ]);

        return {
            total,
            pending,
            confirmed,
            ready,
            dispatched,
            delivered,
            cancelled,
        };
    }

    async getMostSoldProducts(tenantId: string, limit: number = 10) {
        const result = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    tenantId,
                    status: {
                        notIn: ['CANCELLED'],
                    },
                },
            },
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        // Get product details
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: result.map((r) => r.productId),
                },
            },
        });

        return result.map((r) => {
            const product = products.find((p) => p.id === r.productId);
            return {
                product,
                totalSold: r._sum.quantity || 0,
            };
        });
    }

    async getDashboardStats(tenantId: string) {
        const [orderStats, totalRevenue, lowStockCount, customerCount] =
            await Promise.all([
                this.getOrderStats(tenantId),
                this.prisma.order.aggregate({
                    where: {
                        tenantId,
                        status: {
                            notIn: ['CANCELLED'],
                        },
                    },
                    _sum: {
                        totalAmount: true,
                    },
                }),
                this.prisma.product.count({
                    where: {
                        tenantId,
                        stock: {
                            lte: 10,
                        },
                    },
                }),
                this.prisma.customer.count({ where: { tenantId } }),
            ]);

        return {
            orders: orderStats,
            totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
            lowStockCount,
            customerCount,
        };
    }
}
