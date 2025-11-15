import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'ユーザーの名前',
    example: '田中 太郎'
  })
  @IsString()
  @IsOptional()
  name?: string;
}
