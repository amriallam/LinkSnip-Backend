import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../entities/url.entity';
import { CreateUrlDto } from '../dto/create-url.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UrlWithVisitCountResponseDto } from "../dto/url-with-visit-count-response-dto";
import { ConfigService } from '../../infrastructure/config/config.service';
import { generateShortCode } from '../../common/utils/shortcode.util';
import { Visit } from '../../visit/entities/visit.entity';
import { VisitService } from '../../visit/services/visit.service';

@Injectable()
export class UrlService {
  private readonly shortCodeLength: number;
  private readonly cacheTtl: number;
  private readonly logger = new Logger(UrlService.name);

  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
    private visitService: VisitService,
  ) {
    this.shortCodeLength = this.configService.getNumber('URL_SHORT_CODE_LENGTH');
    this.cacheTtl = this.configService.getNumber('CACHE_TTL');
  }

  private async getUrlsWithVisitCountsQuery(skip: number, take: number) {
    return this.urlRepository
      .createQueryBuilder("url")
      .leftJoin("url.visits", "visit")
      .select(["url.shortCode", "url.longUrl"])
      .addSelect("COUNT(visit.id)", "visitCount")
      .groupBy("url.shortCode")
      .skip(skip)
      .take(take)
      .getRawMany();
  }

  async create(createUrlDto: CreateUrlDto): Promise<Url> {
    const { longUrl } = createUrlDto;
    let url = await this.urlRepository.findOne({ where: { longUrl } });
    if (url) {
      this.logger.log(`URL already exists for longUrl: ${longUrl}`);
      return url;
    }
    const shortCode = generateShortCode(this.shortCodeLength);
    url = this.urlRepository.create({ longUrl, shortCode });
    await this.urlRepository.save(url);
    this.logger.log(`Created new URL: ${shortCode} -> ${longUrl}`);
    this.cacheManager.set(shortCode, JSON.stringify(url), this.cacheTtl);
    this.logger.log(`Cached URL for shortCode: ${shortCode}`);
    return url;
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const cachedUrlStr = await this.cacheManager.get<string>(shortCode);
    if (cachedUrlStr) {
      this.logger.log(`Cache hit for shortCode: ${shortCode}`);
      const cachedUrl = JSON.parse(cachedUrlStr);
      return cachedUrl;
    }
    this.logger.log(`Cache miss for shortCode: ${shortCode}`);
    const url = await this.urlRepository.findOne({ where: { shortCode } });
    if (!url) {
      this.logger.warn(`URL not found for shortCode: ${shortCode}`);
      throw new NotFoundException('URL not found');
    }
    this.cacheManager.set(shortCode, JSON.stringify(url), this.cacheTtl);
    this.logger.log(`Cached URL for shortCode: ${shortCode}`);
    return url;
  }

  async getUrlsPaginated(skip: number = 0, take: number = 10): Promise<Url[]> {
    return this.urlRepository.find({ skip, take });
  }

  async getUrlsWithVisitCountsPaginated(skip: number, take: number): Promise<UrlWithVisitCountResponseDto[]> {
    const result = await this.getUrlsWithVisitCountsQuery(skip, take);

    return result.map(r => ({
      shortCode: r.url_shortCode,
      longUrl: r.url_longUrl,
      visitCount: parseInt(r.visitCount, 10),
    }));
  }

  async getUrlAndCount(shortCode: string): Promise<UrlWithVisitCountResponseDto> {
    const result = await this.urlRepository
      .createQueryBuilder("url")
      .leftJoinAndSelect("url.visits", "visit")
      .where("url.shortCode = :shortCode", { shortCode })
      .groupBy("url.shortCode")
      .addSelect("COUNT(visit.id)", "visitCount")
      .getRawOne();

    if (!result) {
      throw new NotFoundException(`URL not found`);
    }

    return {
      shortCode: result.url_shortCode,
      longUrl: result.url_longUrl,
      visitCount: parseInt(result.visitCount, 10),
    };
  }

  async bulkCreate(createUrlDtos: CreateUrlDto[]): Promise<Url[]> {
    const longUrls = createUrlDtos.map(dto => dto.longUrl);
    const existingUrls = await this.urlRepository.find({ where: longUrls.map(longUrl => ({ longUrl })) });
    const existingUrlMap = new Map(existingUrls.map(url => [url.longUrl, url]));
    const newUrlsToCreate = createUrlDtos.filter(dto => !existingUrlMap.has(dto.longUrl)).map(dto =>
      this.urlRepository.create({
        longUrl: dto.longUrl,
        shortCode: generateShortCode(this.shortCodeLength),
      })
    );
    const savedNewUrls = newUrlsToCreate.length > 0 ? await this.urlRepository.save(newUrlsToCreate) : [];
    const allUrls = [
      ...existingUrls,
      ...savedNewUrls
    ];
    allUrls.forEach(url => this.cacheManager.set(url.shortCode, JSON.stringify(url), this.cacheTtl));
    this.logger.log(`Bulk cached ${allUrls.length} URLs`);
    const urlMap = new Map(allUrls.map(url => [url.longUrl, url]));
    return longUrls.map(longUrl => urlMap.get(longUrl)!);
  }
} 
