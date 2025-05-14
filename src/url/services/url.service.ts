import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../entities/url.entity';
import { CreateUrlDto } from '../dto/create-url.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UrlWithVisitCountResponseDto } from "../dto/url-with-visit-count-response-dto";
import { ConfigService } from '../../infrastructure/config/config.service';
import { encodeBase62 } from '../../common/utils/base62.util';

@Injectable()
export class UrlService {
  private readonly cacheTtl: number;
  private readonly minShortCodeValue: number;
  private readonly maxShortCodeValue: number;

  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = this.configService.getNumber('CACHE_TTL') || 3600;
    this.minShortCodeValue = this.configService.getNumber('MIN_SHORT_CODE_VALUE') || 1000000;
    this.maxShortCodeValue = this.configService.getNumber('MAX_SHORT_CODE_VALUE') || 9999999;
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
    const { longUrl, customAlias } = createUrlDto;
    let shortCode: string;

    if (customAlias) {
      const existingUrl = await this.urlRepository.findOne({ where: { shortCode: customAlias } });
      if (existingUrl) {
        throw new ConflictException('Custom alias already in use');
      }
      shortCode = customAlias;
    } else {
      shortCode = this.generateShortCode();
      while (await this.urlRepository.findOne({ where: { shortCode } })) {
        shortCode = this.generateShortCode();
      }
    }

    const url = this.urlRepository.create({ longUrl, shortCode });
    await this.urlRepository.save(url);
    await this.cacheManager.set(shortCode, longUrl, this.cacheTtl);
    return url;
  }

  async findOne(shortCode: string): Promise<string> {
    const cachedUrl = await this.cacheManager.get<string>(shortCode);
    if (cachedUrl) {
      return cachedUrl;
    }

    const url = await this.urlRepository.findOne({ where: { shortCode } });
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.cacheManager.set(shortCode, url.longUrl, this.cacheTtl);
    return url.longUrl;
  }

  private generateShortCode(): string {
    const randomNum = Math.floor(Math.random() * (this.maxShortCodeValue - this.minShortCodeValue + 1)) + this.minShortCodeValue;
    return encodeBase62(randomNum);
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
