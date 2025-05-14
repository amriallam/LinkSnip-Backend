import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private static instance: ConfigService | null = null;
  private readonly env: EnvConfig;

  constructor(filePath: string) {
    const configs = dotenv.parse(fs.readFileSync(filePath));
    this.env = this.validateInput(configs);
  }

  static getInstance(): ConfigService {
    if (this.instance === null) {
      this.instance = new ConfigService(`${process.env.NODE_ENV || 'development'}.env`);
    }
    return this.instance;
  }

  getString(key: string): string {
    return this.env[key];
  }

  getNumber(key: string): number {
    return parseFloat(this.env[key]);
  }

  getBoolean(key: string): boolean {
    return this.env[key] === 'true';
  }

  private validateInput(env: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      PORT: Joi.number().default(80),
      DATABASE_HOST: Joi.string().required(),
      DATABASE_PORT: Joi.number().default(3306),
      DATABASE_USER: Joi.string().required(),
      DATABASE_PASSWORD: Joi.string().required(),
      DATABASE_NAME: Joi.string().required(),
      BASE_URL: Joi.string().uri().required(),
      DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
      CACHE_HOST: Joi.string().required(),
      CACHE_PORT: Joi.number().required(),
      CACHE_TTL: Joi.number().required(),
      THROTTLER_TTL: Joi.number().required(),
      THROTTLER_LIMIT: Joi.number().required(),
      URL_SHORT_CODE_LENGTH: Joi.number().default(10),
    });

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(env, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      throw new Error(`Configuration validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }
}

const config = ConfigService.getInstance();

export { config };
