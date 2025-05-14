# ✨ URL Shortener Service ✨

🚀 A lightning-fast and robust URL shortening service built with the power of NestJS! Features include intelligent rate limiting, blazing-fast caching with Redis, and insightful analytics.

## 🌟 Features

- **🔗 URL Shortening**: Magically transform long, cumbersome URLs into short, shareable codes.
- **🛡️ Rate Limiting**: Keep your service secure and fair with configurable request limits.
- **⚡ Caching**: Enjoy super-speedy responses thanks to Redis-powered caching.
- **📊 Analytics**: Gain valuable insights by tracking URL visits and generating usage statistics.
- **🔳 QR Code Generation**: Instantly generate QR codes for your shortened URLs.
- **➕ Bulk URL Creation**: Create multiple short links in one go with our bulk creation feature.
- **📄 Pagination**: Effortlessly navigate through your shortened URLs with easy-to-use pagination.

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- MySQL or MariaDB
- Redis (for caching and a speed boost!)

## 🚀 Getting Started: Installation

1.  **Clone the Awesomeness**:
    ```bash
    git clone <your-repository-url> # Replace <your-repository-url> with your actual repo URL
    cd url-shortener
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Your Environment**:
    Copy the example environment file:
    ```bash
    cp development.env.example development.env
    ```
    Then, edit `development.env` with your specific database credentials, Redis settings, etc.

4.  **Launch the Rocket!** (Start the application):
    ```bash
    npm run start:dev
    ```
    Your service should now be running, typically at `http://localhost:3000`.

## 📚 API Documentation

All API endpoints are documented using Swagger UI.
Once the application is running, you can typically access the interactive API documentation at:
`http://localhost:3000/api` (Please adjust the port if you've configured it differently).

## 💻 Development Power-Ups

### Run Tests 🧪
```bash
npm run test
```

### Build for Production 📦
```bash
npm run build
```

### Run in Production Mode ✨
```bash
npm run start:prod
```

## 🤝 Contributing

Got ideas to make this even better? Contributions are welcome!

1. Fork the repository.
2. Create your amazing feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

Happy Shortening! 🎉
