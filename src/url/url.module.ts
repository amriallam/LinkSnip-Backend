import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { UrlService } from './services/url.service';
import { UrlController } from './controllers/url.controller';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule } from '../infrastructure/config/config.module';
import { ConfigService } from '../infrastructure/config/config.service';
import { Visit } from '../visit/entities/visit.entity';
import { VisitService } from '../visit/services/visit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Url, Visit]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.getString('CACHE_HOST'),
        port: configService.getNumber('CACHE_PORT'),
        ttl: configService.getNumber('CACHE_TTL'),
      }),
    }),
  ],
  controllers: [UrlController],
  providers: [UrlService, VisitService],
})
export class UrlModule {}
