import { Module } from '@nestjs/common';
import { UrlModule } from './url/url.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './infrastructure/config/config.service';
import { ConfigModule } from './infrastructure/config/config.module';
import { VisitModule } from './visit/visit.module';
import { ThrottlerConfigModule } from './infrastructure/throttler/throttler.module';
import { typeOrmConfigFactory } from './data-source';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    UrlModule,
    VisitModule,
    ThrottlerConfigModule
  ],
})
export class AppModule { }
