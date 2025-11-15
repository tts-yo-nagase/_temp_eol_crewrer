import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticatedRequest } from './types/auth.interface';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getLandingPage();
  }

  // Public endpoint for testing
  @Get('protected-public')
  getProtectedPublic(): {
    message: string;
    timestamp: string;
    serverInfo: string;
  } {
    return {
      message: 'This is public protected data from NestJS server',
      timestamp: new Date().toISOString(),
      serverInfo: 'NestJS Server on port 3010'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtectedData(@Request() req: AuthenticatedRequest): {
    message: string;
    user: AuthenticatedRequest['user'];
  } {
    return {
      message: 'This is protected data from NestJS server',
      user: req.user
    };
  }
}
