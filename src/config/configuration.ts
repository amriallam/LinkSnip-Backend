export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'root',
    database: process.env.DATABASE_NAME || 'url_shortner',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  },
  baseUrl: process.env.BASE_URL || 'http://localhost:3000/',
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // Default to 1 hour if not set
  },
  url: {
    shortCodeLength: parseInt(process.env.URL_SHORT_CODE_LENGTH || '10', 10),
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
}); 