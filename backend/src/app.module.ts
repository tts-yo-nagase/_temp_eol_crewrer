import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // サーバーレス環境ではThrottlerを無効化（各リクエストが独立したインスタンスで実行されるため）
    ...(process.env.VERCEL !== '1'
      ? [
          ThrottlerModule.forRoot([
            {
              ttl: 60000, // 60 seconds
              limit: 100 // 100 requests per ttl (default for most endpoints)
            }
          ])
        ]
      : []),
    PrismaModule,
    PassportModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CompanyModule,
    UsersModule,
    TenantsModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [
    JwtStrategy,
    AppService,
    // Vercel以外の環境ではリクエスト制限を有効化
    ...(process.env.VERCEL !== '1'
      ? [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
          }
        ]
      : []),
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }
  ]
})
export class AppModule {}
