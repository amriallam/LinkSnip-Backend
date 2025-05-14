import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { UrlService } from 'src/url/services/url.service';
import { VisitService } from 'src/visit/services/visit.service';

@Module({
  controllers: [StatsController],
  providers: [UrlService, VisitService],
})
export class StatsModule { }
