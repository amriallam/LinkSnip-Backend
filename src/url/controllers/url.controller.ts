import { Controller, Get, Post, Body, Param, Res, HttpStatus, Query } from '@nestjs/common';
import { UrlService } from '../services/url.service';
import { CreateUrlDto } from '../dto/create-url.dto';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Get(':shortCode')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const longUrl = await this.urlService.findOne(shortCode);
    return res.redirect(HttpStatus.FOUND, longUrl);
  }

  @Get()
  async getUrls(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.urlService.getUrlsPaginated(skip, take);
  }
} 