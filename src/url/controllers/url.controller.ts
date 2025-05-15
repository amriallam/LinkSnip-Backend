import { Controller, Get, Post, Body, Param, Query, Request, Res, Logger } from '@nestjs/common';
import { UrlService } from '../services/url.service';
import { CreateUrlDto } from '../dto/create-url.dto';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getClientIp } from 'src/common/utils/request.util';
import { ConfigService } from '../../infrastructure/config/config.service';
import { VisitService } from '../../visit/services/visit.service';

@ApiTags('')
@Controller()
export class UrlController {
  private readonly logger = new Logger(UrlController.name);
  constructor(
    private readonly urlService: UrlService,
    private readonly configService: ConfigService,
    private readonly visitService: VisitService,
  ) {
    this.baseUrl = this.configService.getString('BASE_URL');
  }

  private readonly baseUrl: string;

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({ status: 201, description: 'URL successfully shortened.' })
  async create(@Body() createUrlDto: CreateUrlDto) {
    this.logger.log(`POST / - Create short URL for: ${createUrlDto.longUrl}`);
    return this.urlService.create(createUrlDto);
  }

  @Post('bulk')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiOperation({ summary: 'Bulk shorten URLs' })
  @ApiResponse({ status: 201, description: 'URLs successfully shortened.' })
  async bulkCreate(@Body() createUrlDtos: CreateUrlDto[]) {
    this.logger.log(`POST /bulk - Bulk create short URLs for ${createUrlDtos.length} URLs`);
    return this.urlService.bulkCreate(createUrlDtos);
  }

  @Get(':shortCode')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL.' })
  async redirect(@Param('shortCode') shortCode: string, @Request() req) {
    this.logger.log(`GET /${shortCode} - Redirect requested`);
    const url = await this.urlService.findByShortCode(shortCode);
    const ipAddress = getClientIp(req);
    this.visitService.saveVisit(shortCode, ipAddress);
    return { originalUrl: url.longUrl };
  }

  @Get()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: 'Get paginated list of URLs' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of URLs.' })
  async getUrls(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10'
  ) {
    this.logger.log(`GET / - Get paginated URLs (skip=${skip}, take=${take})`);
    return this.urlService.getUrlsWithVisitCountsPaginated(
      parseInt(skip, 10),
      parseInt(take, 10)
    );
  }

  @Post('visit-counts')
  @ApiOperation({ summary: 'Get visit counts for multiple short codes' })
  @ApiResponse({ status: 200, description: 'Returns visit counts for the given short codes.' })
  async getVisitCounts(@Body() body: { shortCodes: string[] }) {
    this.logger.log(`POST /visit-counts - Get visit counts for ${body.shortCodes.length} short codes`);
    return this.visitService.getVisitCountsByShortCodes(body.shortCodes);
  }
} 