# Deployment Guide

This guide provides step-by-step instructions for deploying the Croevo AI application to various platforms.

## Prerequisites

Before deploying, ensure you have:
- A MongoDB database (MongoDB Atlas recommended for cloud deployment)
- Node.js 18.x or higher installed
- Your environment variables configured
- The application tested locally

## Environment Variables

Create a `.env` file based on `.env.example` and configure the following variables:

```env
MONGODB_URI=your-mongodb-connection-string
ADMIN_USER=your-admin-username
ADMIN_PASS=your-secure-password
JWT_SECRET=your-jwt-secret-key
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

**Security Note:** Never commit your `.env` file to version control!

---

## Deployment Options

### Option 1: Netlify (Serverless)

Netlify is great for serverless deployments with automatic CI/CD.

#### Steps:

1. **Prepare your repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

3. **Configure build settings:**
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: `functions`

4. **Set environment variables:**
   - Go to Site settings → Environment variables
   - Add all variables from your `.env` file

5. **Deploy:**
   - Netlify will automatically deploy on every push to main branch

#### Configuration File:

The project includes `netlify.toml` with the following configuration:
```toml
[build]
  command = "npm install"
  functions = "functions"
  publish = "public"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

---

### Option 2: Vercel (Serverless)

Vercel offers excellent performance and easy deployment.

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables:**
   ```bash
   vercel env add MONGODB_URI
   vercel env add ADMIN_USER
   vercel env add ADMIN_PASS
   vercel env add JWT_SECRET
   vercel env add ALLOWED_ORIGINS
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

#### Configuration File:

The project includes `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "functions/api.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/functions/api.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```


---

### Option 3: Traditional Hosting (VPS, AWS EC2, DigitalOcean, etc.)

For full control and traditional server deployment.

#### Steps:

1. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js and npm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 (Process Manager):**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone your repository:**
   ```bash
   git clone https://github.com/yourusername/croevo-ai.git
   cd croevo-ai
   ```

5. **Install dependencies:**
   ```bash
   npm install --production
   ```

6. **Create .env file:**
   ```bash
   nano .env
   # Add your environment variables
   ```

7. **Start the application with PM2:**
   ```bash
   pm2 start server.js --name croevo-ai
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx as reverse proxy:**
   ```bash
   sudo nano /etc/nginx/sites-available/croevo-ai
   ```

   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/croevo-ai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Set up SSL with Let's Encrypt:**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

---

## MongoDB Setup

### MongoDB Atlas (Recommended for Cloud)

1. **Create account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create cluster:**
   - Click "Build a Database"
   - Choose "Free" tier
   - Select your preferred region

3. **Configure access:**
   - Database Access: Create a database user
   - Network Access: Add your IP address (or 0.0.0.0/0 for all IPs)

4. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add to your `.env` file as `MONGODB_URI`

---

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] MongoDB connection is working
- [ ] Admin login works
- [ ] API endpoints respond correctly
- [ ] Static files are served properly
- [ ] SSL certificate is installed (for production)
- [ ] CORS is configured for your domain
- [ ] Rate limiting is active
- [ ] Error logging is working
- [ ] Health check endpoint (`/health`) returns OK

---

## Monitoring and Maintenance

### Health Checks

Monitor your application health:
```bash
curl https://yourdomain.com/health
```

### View Logs (PM2)

```bash
pm2 logs croevo-ai
pm2 monit
```

### Update Application

```bash
git pull origin main
npm install
pm2 restart croevo-ai
```

### Backup Database

Set up automated backups for your MongoDB database:
- MongoDB Atlas: Automated backups are included
- Self-hosted: Use `mongodump` for backups

---

## Troubleshooting

### Application won't start
- Check environment variables are set
- Verify MongoDB connection string
- Check Node.js version (must be 18.x+)
- Review logs for errors

### 502 Bad Gateway (Nginx)
- Ensure application is running (`pm2 status`)
- Check if port 3000 is accessible
- Verify Nginx configuration

### Database connection errors
- Verify MongoDB URI is correct
- Check network access settings in MongoDB Atlas
- Ensure database user credentials are correct

### CORS errors
- Add your domain to `ALLOWED_ORIGINS`
- Restart the application after changes

---

## Security Recommendations

1. **Use strong passwords** for admin account
2. **Generate secure JWT secret** (32+ characters)
3. **Enable HTTPS** in production
4. **Restrict CORS** to specific domains
5. **Keep dependencies updated** (`npm audit fix`)
6. **Use environment variables** for all secrets
7. **Enable firewall** on your server
8. **Regular backups** of your database
9. **Monitor logs** for suspicious activity
10. **Use rate limiting** (already configured)

---

## Support

For issues or questions:
- Check the [README.md](./README.md) for general information
- Review the [API documentation](./API.md)
- Open an issue on GitHub
