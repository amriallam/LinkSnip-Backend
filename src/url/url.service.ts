import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) { }

  async create(createUrlDto: CreateUrlDto): Promise<Url> {
    const { longUrl } = createUrlDto;
    const shortCode = nanoid(10);

    const url = this.urlRepository.create({ longUrl, shortCode });
    await this.urlRepository.save(url);
    const ttl = this.configService.get<number>('cache.ttl');
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

    const ttl = this.configService.get<number>('cache.ttl');
    await this.cacheManager.set(shortCode, url.longUrl, ttl);
    return url;
  }
} 