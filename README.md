# Team & Careers Management API

A modern, secure Express.js server with MongoDB for managing team members and job postings. Built with security, performance, and scalability in mind.

## ✨ Features

- 🔐 **JWT Authentication** with refresh tokens
- 🚀 **High Performance** with caching and compression
- 📊 **Pagination** for large datasets
- 🛡️ **Security** with Helmet, CORS, rate limiting
- 📝 **Structured Logging** with Winston
- 🏥 **Health Check** endpoint for monitoring
- 📦 **Modular Architecture** with clean separation of concerns

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- MongoDB instance
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd webpage

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/your-database

# Authentication
JWT_SECRET=your-super-secret-jwt-key
ADMIN_USER=admin
ADMIN_PASS=your-secure-password

# Server
PORT=3000
NODE_ENV=development

# CORS (comma-separated origins, or * for all)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 📁 Project Structure

```
webpage/
├── config/           # Configuration files
│   └── index.js      # Centralized config
├── middleware/       # Custom middleware
│   ├── cors.js       # CORS handler
│   └── logger.js     # Winston logger
├── models/           # Mongoose models
│   ├── TeamMember.js
│   └── JobPosting.js
├── routes/           # API routes
│   ├── auth.js       # Authentication
│   ├── content.js    # Content CRUD
│   ├── seed.js       # Database seeding
│   └── health.js     # Health check
├── public/           # Static files
├── data/             # Seed data
│   └── content.json
├── server.js         # Main application
└── package.json
```

## 🔌 API Endpoints

See [API.md](./API.md) for detailed API documentation.

### Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/login` | No | Login and get tokens |
| POST | `/api/refresh` | No | Refresh access token |
| POST | `/api/logout` | No | Logout and invalidate token |
| GET | `/api/content` | No | Get team & careers (paginated) |
| POST | `/api/content` | Yes | Update team & careers |
| POST | `/api/seed` | No | Seed database with initial data |
| GET | `/health` | No | Health check |

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configurable cross-origin requests
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Request Size Limits** - 10MB max body size
- **JWT Tokens** - Secure authentication with refresh tokens
- **Input Validation** - All endpoints validate input

## ⚡ Performance Optimizations

- **Compression** - Gzip compression for responses
- **Caching** - 5-minute cache for content endpoint
- **Database Indexes** - Optimized queries
- **Pagination** - Efficient data loading

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "mongodb": {
    "connected": true,
    "state": "connected"
  },
  "memory": {
    "used": "45 MB",
    "total": "100 MB"
  }
}
```

## 🧪 Testing

```bash
# Run security verification tests
npm test

# The test script checks:
# - Server reachability
# - Security headers
# - Authentication flow
# - Protected routes
# - Rate limiting
```

## 📝 Logging

Logs are output to console with structured JSON format in production:

```javascript
// Development
2026-02-12 10:00:00 [info]: Server running on port 3000

// Production
{"timestamp":"2026-02-12T10:00:00.000Z","level":"info","message":"Server running on port 3000"}
```

## 🚢 Deployment

### Netlify/Vercel

The project includes configuration files for serverless deployment:

- `netlify.toml` - Netlify configuration
- `vercel.json` - Vercel configuration
- `functions/api.js` - Serverless function wrapper

### Traditional Hosting

```bash
# Set environment to production
export NODE_ENV=production

# Start the server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions, please open an issue on GitHub.