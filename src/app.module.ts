import { Module } from '@nestjs/common';
import { UrlModule } from './url/url.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url/entities/url.entity';
import { Visit } from './visit/entities/visit.entity';
import { ConfigService } from './infrastructure/config/config.service';
import { ConfigModule } from './infrastructure/config/config.module';
import { VisitModule } from './visit/visit.module';
import { ThrottlerConfigModule } from './infrastructure/throttler/throttler.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getString('DATABASE_HOST'),
        port: configService.getNumber('DATABASE_PORT'),
        username: configService.getString('DATABASE_USER'),
        password: configService.getString('DATABASE_PASSWORD'),
        database: configService.getString('DATABASE_NAME'),
        synchronize: configService.getBoolean('DATABASE_SYNCHRONIZE'),
        entities: [Url, Visit],
      }),
    }),
    UrlModule,
    VisitModule,
    ThrottlerConfigModule
  ],
})
export class AppModule { }
