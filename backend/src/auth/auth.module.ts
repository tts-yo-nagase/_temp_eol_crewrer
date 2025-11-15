import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
      signOptions: { expiresIn: '1h' }
    })
  ],
  providers: [JwtStrategy, RolesGuard],
  exports: [JwtModule, PassportModule, RolesGuard]
})
export class AuthModule {}
