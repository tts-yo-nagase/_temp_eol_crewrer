import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, IsArray, ArrayMinSize } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: '無効なメールアドレスです' })
  email: string;

  @IsString({ message: 'パスワードは文字列である必要があります' })
  @MinLength(6, { message: 'パスワードは6文字以上である必要があります' })
  @IsOptional()
  password?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  roles?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  image?: string;
}
