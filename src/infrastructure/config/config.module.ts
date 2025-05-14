import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: () => {
        return ConfigService.getInstance();
      },
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
