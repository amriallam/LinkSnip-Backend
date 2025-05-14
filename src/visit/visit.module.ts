import { Module } from '@nestjs/common';
import { VisitService } from './services/visit.service';
import { Visit } from './entities/visit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from 'src/url/entities/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visit, Url])],
  providers: [VisitService],
  exports: [VisitService],
})
export class VisitModule { }
