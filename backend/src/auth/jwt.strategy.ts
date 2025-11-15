import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// NextAuth JWT payload structure
interface NextAuthJwtPayload {
  // Standard JWT claims
  sub?: string; // User ID (from token.id)
  name?: string;
  email?: string;
  picture?: string; // User image
  iat?: number; // Issued at
  exp?: number; // Expires at
  jti?: string; // JWT ID

  // Custom claims from NextAuth callbacks
  id?: string; // User ID (custom field)
  role?: string; // User role
  roles?: string[]; // User roles array
  company?: string; // Company
  customField?: string; // Custom field
  tenantId?: string; // Tenant ID
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Use NEXTAUTH_SECRET which is the same secret used by NextAuth
      secretOrKey: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'devsecret',
      // NextAuth uses HS256 algorithm
      algorithms: ['HS256']
    });
  }

  validate(payload: NextAuthJwtPayload) {
    // Extract user information from NextAuth JWT payload
    const userId = payload.id || payload.sub;
    const userRoles = payload.roles || (payload.role ? [payload.role] : ['user']);

    return {
      sub: userId,
      id: userId,
      name: payload.name || null,
      email: payload.email || null,
      roles: userRoles,
      company: payload.company || null,
      customField: payload.customField || null,
      tenantId: payload.tenantId || null
    };
  }
}
