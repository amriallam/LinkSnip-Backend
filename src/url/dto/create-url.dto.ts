import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({ description: 'The URL to be shortened' })
  @IsUrl()
  longUrl: string;
} 