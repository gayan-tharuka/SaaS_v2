import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register new tenant and owner' })
    async register(
        @Body()
        body: {
            email: string;
            password: string;
            name: string;
            tenantName: string;
        },
    ) {
        return this.authService.register(body);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
}
