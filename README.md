# URL Shortener Service

A robust URL shortening service built with NestJS, featuring rate limiting, caching, and analytics.

## Features

- **URL Shortening**: Convert long URLs into short, manageable codes
- **Rate Limiting**: Protect the service from abuse with configurable rate limits
- **Caching**: Fast response times with Redis caching
- **Analytics**: Track URL visits and generate usage statistics
- **QR Code Generation**: Generate QR codes for shortened URLs
- **Bulk URL Creation**: Create multiple shortened URLs in a single request
- **Pagination**: Efficiently browse through shortened URLs with pagination

## Prerequisites

- Node.js (v14 or higher)
- MySQL/MariaDB
- Redis (for caching)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp development.env.example development.env
```
Edit `development.env` with your configuration.

4. Start the application:
```bash
npm run start:dev
```

## API Documentation

### Create Short URL
```http
POST /urls
Content-Type: application/json

{
  "longUrl": "https://example.com/very/long/url"
}
```

### Bulk Create Short URLs
```http
POST /urls/bulk
Content-Type: application/json

[
  {
    "longUrl": "https://example.com/url1"
  },
  {
    "longUrl": "https://example.com/url2"
  }
]
```

### Redirect to Original URL
```http
GET /urls/{shortCode}
```

### Generate QR Code
```http
GET /urls/{shortCode}/qr
```

### List URLs with Visit Counts
```http
GET /urls?skip=0&take=10
```

## Rate Limits

- Create URL: 5 requests per minute
- Bulk Create: 3 requests per minute
- Redirect/QR Code/List: 10 requests per minute

## Response Examples

### Create URL Response
```json
{
  "id": 1,
  "longUrl": "https://example.com/very/long/url",
  "shortCode": "abc123",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### List URLs Response
```json
[
  {
    "shortCode": "abc123",
    "longUrl": "https://example.com/url1",
    "visitCount": 42
  },
  {
    "shortCode": "def456",
    "longUrl": "https://example.com/url2",
    "visitCount": 15
  }
]
```

### QR Code Response
```json
{
  "qrCode": "data:image/png;base64,..."
}
```

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Running in Production
```bash
npm run start:prod
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
