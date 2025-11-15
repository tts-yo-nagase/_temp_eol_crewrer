import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

type UserWithRolesRaw = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: {
        role: true;
      };
    };
  };
}>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Helper: Include userRoles with roles in queries
  private readonly userInclude = {
    userRoles: {
      include: {
        role: true
      }
    }
  } satisfies Prisma.UserInclude;

  // Helper: Transform user with userRoles to user with roles array
  private transformUserWithRoles(user: UserWithRolesRaw) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userRoles, password, ...userData } = user;
    return {
      ...userData,
      roles: userRoles?.map((ur) => ur.role.name) || []
    };
  }

  async create(createUserDto: CreateUserDto, tenantId: string) {
    // Check if user already exists in this tenant
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        tenantId
      }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this tenant');
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    // Get role IDs from role names
    const roleNames = createUserDto.roles || ['user'];
    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: roleNames
        }
      }
    });

    if (roles.length === 0) {
      throw new NotFoundException('No valid roles found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roles: _roles, ...createData } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...createData,
        password: hashedPassword,
        isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
        tenantId
      },
      include: this.userInclude
    });

    // Create UserRole relations
    await this.prisma.userRole.createMany({
      data: roles.map((role) => ({
        userId: user.id,
        roleId: role.id
      }))
    });

    // Fetch user with roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: this.userInclude
    });

    if (!userWithRoles) {
      throw new NotFoundException('User not found after creation');
    }

    return this.transformUserWithRoles(userWithRoles);
  }

  async findMany(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      include: this.userInclude,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users.map((user) => this.transformUserWithRoles(user));
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId
      },
      include: this.userInclude
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transformUserWithRoles(user);
  }

  async findByEmail(email: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId
      },
      include: this.userInclude
    });

    if (!user) {
      return null;
    }

    return this.transformUserWithRoles(user);
  }

  // For authentication - finds user by email across all tenants (used for login)
  private async findByEmailForAuth(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: this.userInclude
    });

    if (!user) {
      return null;
    }

    // Return user with password (needed for authentication) and roles
    return {
      ...user,
      roles: user.userRoles?.map((ur) => ur.role.name) || []
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId: string) {
    // Check if user exists in this tenant
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being changed, check if new email already exists in this tenant
    if ('email' in updateUserDto && updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          tenantId
        }
      });

      if (emailExists) {
        throw new ConflictException('Email already in use in this tenant');
      }
    }

    // Prepare update data - separate password and roles from other fields
    const { password, roles: roleNames, ...restData } = updateUserDto;

    // Build update data object
    const updateData: Record<string, unknown> = { ...restData };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user basic data
    await this.prisma.user.updateMany({
      where: {
        id,
        tenantId
      },
      data: updateData
    });

    // Update roles if provided
    if (roleNames && roleNames.length > 0) {
      // Get role IDs
      const roles = await this.prisma.role.findMany({
        where: {
          name: {
            in: roleNames
          }
        }
      });

      if (roles.length === 0) {
        throw new NotFoundException('No valid roles found');
      }

      // Delete existing role assignments
      await this.prisma.userRole.deleteMany({
        where: {
          userId: id
        }
      });

      // Create new role assignments
      await this.prisma.userRole.createMany({
        data: roles.map((role) => ({
          userId: id,
          roleId: role.id
        }))
      });
    }

    // Return updated user with roles
    const updatedUser = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId
      },
      include: this.userInclude
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this.transformUserWithRoles(updatedUser);
  }

  async remove(id: string, tenantId: string) {
    // Delete user within tenant scope
    const result = await this.prisma.user.deleteMany({
      where: {
        id,
        tenantId
      }
    });

    if (result.count === 0) {
      throw new NotFoundException('User not found');
    }

    return { success: true, count: result.count };
  }

  async updateOwnProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Update only name (email changes are not allowed for security)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateProfileDto.name
      },
      include: this.userInclude
    });

    return this.transformUserWithRoles(updatedUser);
  }

  async validateUser(authUserDto: AuthUserDto) {
    // Use findByEmailForAuth for login (searches across all tenants)
    const user = await this.findByEmailForAuth(authUserDto.email);

    if (!user || !user.password) {
      return null;
    }

    // Ensure password is a string
    const inputPassword = authUserDto.password;
    if (typeof inputPassword !== 'string') {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(inputPassword, user.password);

    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      roles: user.roles,
      tenantId: user.tenantId
    };
  }

  async upsertUser(email: string, userData: Partial<CreateUserDto>, tenantId?: string) {
    // If no tenantId provided, use default tenant T0001
    let finalTenantId = tenantId;
    if (!finalTenantId) {
      const defaultTenant = await this.prisma.tenant.findUnique({
        where: { slug: 'T0001' }
      });
      if (!defaultTenant) {
        throw new NotFoundException('Default tenant T0001 not found. Please run database seed.');
      }
      finalTenantId = defaultTenant.id;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId: finalTenantId
      }
    });

    if (!existingUser) {
      // Create new user with default 'user' role
      const newUser = await this.prisma.user.create({
        data: {
          email,
          name: userData.name,
          image: userData.image,
          emailVerified: new Date(),
          isActive: true,
          tenantId: finalTenantId
        }
      });

      // Get the default 'user' role
      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' }
      });

      if (!userRole) {
        throw new NotFoundException('Default user role not found');
      }

      // Assign user role
      await this.prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: userRole.id
        }
      });

      // Return user with roles
      const userWithRoles = await this.prisma.user.findUnique({
        where: { id: newUser.id },
        include: this.userInclude
      });

      if (!userWithRoles) {
        throw new NotFoundException('User not found after creation');
      }

      return this.transformUserWithRoles(userWithRoles);
    } else {
      // Update existing user (don't change roles)
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: userData.name,
          image: userData.image,
          emailVerified: new Date()
        },
        include: this.userInclude
      });

      return this.transformUserWithRoles(updatedUser);
    }
  }

  // Get all tenants that the user belongs to with their respective roles
  async getUserTenants(userId: string) {
    const userTenants = await this.prisma.userTenant.findMany({
      where: { userId },
      include: {
        tenant: true
      },
      orderBy: {
        isCurrentTenant: 'desc' // Current tenant first
      }
    });

    return userTenants.map((ut) => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      slug: ut.tenant.slug,
      role: ut.role,
      isCurrentTenant: ut.isCurrentTenant
    }));
  }

  // Switch the user's current tenant and return updated user info with new roles
  async switchTenant(userId: string, tenantId: string) {
    // Verify that the user belongs to the target tenant
    const targetUserTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId
        }
      }
    });

    if (!targetUserTenant) {
      throw new NotFoundException('User does not belong to this tenant');
    }

    // Update isCurrentTenant flag: set all to false, then set target to true
    await this.prisma.$transaction([
      this.prisma.userTenant.updateMany({
        where: { userId },
        data: { isCurrentTenant: false }
      }),
      this.prisma.userTenant.update({
        where: {
          userId_tenantId: {
            userId,
            tenantId
          }
        },
        data: { isCurrentTenant: true }
      }),
      // Update user's tenantId (primary tenant reference)
      this.prisma.user.update({
        where: { id: userId },
        data: { tenantId }
      })
    ]);
    // Get user with roles in the new tenant context
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: this.userInclude
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const transformedUser = this.transformUserWithRoles(user);

    // Return user info with new tenant and role from UserTenant
    return {
      ...transformedUser,
      tenantRole: targetUserTenant.role // Role specific to this tenant
    };
  }
}
