import { Controller, Get, Post, Body, Param, Res, HttpStatus, Query } from '@nestjs/common';
import { UrlService } from '../services/url.service';
import { CreateUrlDto } from '../dto/create-url.dto';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as QRCode from 'qrcode';

@ApiTags('urls')
@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({ status: 201, description: 'URL successfully shortened.' })
  async create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Post('bulk')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiOperation({ summary: 'Bulk shorten URLs' })
  @ApiResponse({ status: 201, description: 'URLs successfully shortened.' })
  async bulkCreate(@Body() createUrlDtos: CreateUrlDto[]) {
    return Promise.all(createUrlDtos.map(dto => this.urlService.create(dto)));
  }

  @Get(':shortCode')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL.' })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const url = await this.urlService.findByShortCode(shortCode);
    return res.redirect(HttpStatus.FOUND, url.longUrl);
  }

  @Get(':shortCode/qr')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: 'Generate QR code for shortened URL' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully.' })
  async generateQRCode(@Param('shortCode') shortCode: string) {
    const url = await this.urlService.findByShortCode(shortCode);
    const qrCode = await QRCode.toDataURL(url.longUrl);
    return { qrCode };
  }

  @Get()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: 'Get paginated list of URLs' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of URLs.' })
  async getUrls(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10'
  ) {
    return this.urlService.getUrlsWithVisitCountsPaginated(
      parseInt(skip, 10),
      parseInt(take, 10)
    );
  }
} 