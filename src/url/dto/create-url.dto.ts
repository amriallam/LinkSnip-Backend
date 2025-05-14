import { IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({ description: 'The URL to be shortened' })
  @IsString()
  @IsUrl()
  longUrl: string;

  @ApiProperty({ description: 'Custom short URL alias (optional)', required: false })
  @IsString()
  @IsOptional()
  customAlias?: string;
} 