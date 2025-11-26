import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    getDashboard(@Request() req) {
        return this.analyticsService.getDashboardStats(req.user.tenantId);
    }

    @Get('revenue')
    getRevenue(
        @Request() req,
        @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    ) {
        return this.analyticsService.getRevenue(req.user.tenantId, period);
    }

    @Get('most-sold')
    getMostSold(@Request() req, @Query('limit') limit?: string) {
        return this.analyticsService.getMostSoldProducts(
            req.user.tenantId,
            limit ? parseInt(limit) : 10,
        );
    }
}
