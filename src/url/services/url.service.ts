import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

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
    const shortCodeLength = this.configService.getNumber('URL_SHORT_CODE_LENGTH');
    const shortCode = generateShortCode(shortCodeLength);

    const url = this.urlRepository.create({ longUrl, shortCode });
    await this.urlRepository.save(url);
    const ttl = this.configService.getNumber('CACHE_TTL');
    await this.cacheManager.set(shortCode, longUrl, ttl);
    return url;
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const cachedUrl = await this.cacheManager.get<string>(shortCode);
    if (cachedUrl) {
      return { id: 0, longUrl: cachedUrl, shortCode, createdAt: new Date(), visits: [] };
    }

    const url = await this.urlRepository.findOne({ where: { shortCode } });
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    const ttl = this.configService.getNumber('CACHE_TTL');
    await this.cacheManager.set(shortCode, url.longUrl, ttl);
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
}
