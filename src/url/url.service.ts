import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createUrlDto: CreateUrlDto): Promise<Url> {
    const { longUrl, customAlias } = createUrlDto;
    let shortUrl: string;

    if (customAlias) {
      const existingUrl = await this.urlRepository.findOne({ where: { shortUrl: customAlias } });
      if (existingUrl) {
        throw new ConflictException('Custom alias already in use');
      }
      shortUrl = customAlias;
    } else {
      shortUrl = this.generateShortUrl();
    }

    const url = this.urlRepository.create({ longUrl, shortUrl });
    await this.urlRepository.save(url);
    await this.cacheManager.set(shortUrl, longUrl, 3600); // Cache for 1 hour
    return url;
  }

  async findOne(shortUrl: string): Promise<string> {
    const cachedUrl = await this.cacheManager.get<string>(shortUrl);
    if (cachedUrl) {
      return cachedUrl;
    }

    const url = await this.urlRepository.findOne({ where: { shortUrl } });
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.cacheManager.set(shortUrl, url.longUrl, 3600);
    return url.longUrl;
  }

  private generateShortUrl(): string {
    return Math.random().toString(36).substring(2, 8);
  }
} 