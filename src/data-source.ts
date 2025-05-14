import { ConfigService, config } from './infrastructure/config/config.service';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Url } from './url/entities/url.entity';
import { Visit } from './visit/entities/visit.entity';
import { DataSource } from 'typeorm';

export const typeOrmConfigFactory = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.getString('DATABASE_HOST'),
  port: config.getNumber('DATABASE_PORT'),
  username: config.getString('DATABASE_USER'),
  password: config.getString('DATABASE_PASSWORD'),
  database: config.getString('DATABASE_NAME'),
  synchronize: config.getBoolean('DATABASE_SYNCHRONIZE'),
  entities: [Url, Visit],
});

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.getString('DATABASE_HOST'),
  port: config.getNumber('DATABASE_PORT'),
  username: config.getString('DATABASE_USER'),
  password: config.getString('DATABASE_PASSWORD'),
  database: config.getString('DATABASE_NAME'),
  synchronize: false,
  entities: [Url, Visit],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
});
