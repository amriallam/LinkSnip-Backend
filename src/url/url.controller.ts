import { Controller, Post, Body, Get, Param, HttpCode } from '@nestjs/common';
import { UrlService } from './services/url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as QRCode from 'qrcode';

@ApiTags('urls')
@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({ status: 201, description: 'URL successfully shortened.' })
  async create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk shorten URLs' })
  @ApiResponse({ status: 201, description: 'URLs successfully shortened.' })
  async bulkCreate(@Body() createUrlDtos: CreateUrlDto[]) {
    return Promise.all(createUrlDtos.map(dto => this.urlService.create(dto)));
  }

  @Get(':shortUrl')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL.' })
  @HttpCode(302)
  async redirect(@Param('shortUrl') shortUrl: string) {
    const longUrl = await this.urlService.findOne(shortUrl);
    return { url: longUrl };
  }

  @Get(':shortUrl/qr')
  @ApiOperation({ summary: 'Generate QR code for shortened URL' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully.' })
  async generateQRCode(@Param('shortUrl') shortUrl: string) {
    const longUrl = await this.urlService.findOne(shortUrl);
    const qrCode = await QRCode.toDataURL(longUrl);
    return { qrCode };
  }
}