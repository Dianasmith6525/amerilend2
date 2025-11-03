# Production Deployment Checklist

This document provides a comprehensive checklist for deploying AmeriLend to production.

## Pre-Deployment

### 1. Environment Variables

Create a `.env` file in production with all required variables (see `.env.example`):

```bash
# Required for all deployments
DATABASE_URL=mysql://user:password@host:3306/amerilend
JWT_SECRET=<generate-strong-random-string>
OAUTH_SERVER_URL=<your-oauth-server>
VITE_APP_ID=<your-app-id>
OWNER_OPEN_ID=<admin-user-open-id>
NODE_ENV=production
PORT=3000

# Payment providers
AUTHORIZENET_API_LOGIN_ID=<production-login-id>
AUTHORIZENET_TRANSACTION_KEY=<production-transaction-key>
AUTHORIZENET_ENVIRONMENT=production
AUTHORIZENET_SIGNATURE_KEY=<webhook-signature-key>

COINBASE_COMMERCE_API_KEY=<production-api-key>
COINBASE_COMMERCE_WEBHOOK_SECRET=<webhook-secret>
CRYPTO_PAYMENT_ENVIRONMENT=production
```

### 2. Database Setup

- [ ] Create production MySQL database
- [ ] Run migrations: `pnpm run db:push`
- [ ] Verify all tables are created
- [ ] Create database backups schedule
- [ ] Set up read replicas (optional, for scale)

### 3. Security Review

- [ ] Ensure JWT_SECRET is a strong random string (min 64 characters)
- [ ] Enable HTTPS/SSL for all traffic
- [ ] Configure CORS properly (restrict origins)
- [ ] Review rate limiting settings in `server/_core/rateLimiter.ts`
- [ ] Enable security headers (helmet middleware)
- [ ] Set up Web Application Firewall (WAF) if using cloud provider

### 4. Payment Gateway Configuration

#### Authorize.net
- [ ] Switch from sandbox to production environment
- [ ] Configure production API credentials
- [ ] Set up webhook endpoint: `https://yourdomain.com/api/webhooks/authorizenet`
- [ ] Add webhook signature key to environment variables
- [ ] Test payment flow with real card (use test amount like $0.01)

#### Coinbase Commerce (Crypto)
- [ ] Create production Coinbase Commerce account
- [ ] Configure production API key
- [ ] Set up webhook endpoint: `https://yourdomain.com/api/webhooks/crypto`
- [ ] Add webhook secret to environment variables
- [ ] Test crypto payment with small amount

### 5. Email Service Setup

- [ ] Choose email provider (SendGrid, AWS SES, Resend, etc.)
- [ ] Update `server/_core/otp.ts` to use real email service
- [ ] Test OTP email delivery
- [ ] Configure email templates
- [ ] Set up SPF, DKIM, DMARC records for email domain

## Build and Deploy

### 6. Build Application

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Run tests
pnpm test

# Type check
pnpm run check

# Build production bundle
pnpm run build
```

Verify `dist/` folder contains:
- `index.js` (server bundle)
- `assets/` (client assets)
- `index.html`

### 7. Deploy Options

#### Option A: VPS/Dedicated Server (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start dist/index.js --name amerilend

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

#### Option B: Docker Deployment

```dockerfile
# Dockerfile (create in project root)
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
# Build and run
docker build -t amerilend .
docker run -p 3000:3000 --env-file .env amerilend
```

#### Option C: Cloud Platform (Railway, Render, Fly.io)

1. Connect GitHub repository
2. Add environment variables via dashboard
3. Configure build command: `pnpm install && pnpm build`
4. Configure start command: `pnpm start`
5. Deploy

### 8. Reverse Proxy (nginx)

```nginx
# /etc/nginx/sites-available/amerilend
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment

### 9. Monitoring Setup

- [ ] Set up application monitoring (PM2 monitoring, DataDog, New Relic)
- [ ] Configure error tracking (Sentry, Rollbar, LogRocket)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure log aggregation (CloudWatch, Papertrail, Loggly)
- [ ] Set up performance monitoring (Google Analytics, Mixpanel)

### 10. Testing in Production

- [ ] Test user signup flow (OTP)
- [ ] Test user login flow (OTP)
- [ ] Submit test loan application
- [ ] Approve loan application (admin)
- [ ] Test card payment with real transaction
- [ ] Test crypto payment with small amount
- [ ] Verify webhook processing works
- [ ] Test loan disbursement flow
- [ ] Verify legal document acceptance tracking

### 11. Security Hardening

```bash
# Install security packages
pnpm add helmet compression

# Update server/_core/index.ts
import helmet from 'helmet';
import compression from 'compression';

app.use(helmet());
app.use(compression());
```

- [ ] Enable helmet security headers
- [ ] Configure Content Security Policy (CSP)
- [ ] Set up rate limiting (already configured)
- [ ] Enable request size limits (already configured at 50mb)
- [ ] Configure CORS properly
- [ ] Set up DDoS protection (Cloudflare, AWS Shield)

### 12. Backups

- [ ] Database backups (daily automated)
- [ ] Application logs rotation
- [ ] User uploaded files backup (if applicable)
- [ ] Configuration backup
- [ ] Test restore procedure

### 13. SSL/TLS Certificate

- [ ] Obtain SSL certificate (Let's Encrypt recommended)
- [ ] Configure auto-renewal
- [ ] Test SSL configuration (SSL Labs)
- [ ] Enforce HTTPS redirects
- [ ] Set HSTS header

### 14. DNS Configuration

- [ ] Point domain A record to server IP
- [ ] Configure www subdomain (CNAME or redirect)
- [ ] Set up email DNS records (SPF, DKIM, DMARC)
- [ ] Configure CAA records for SSL

### 15. Legal & Compliance

- [ ] Verify all legal documents are up to date
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Verify PCI DSS compliance for payment processing
- [ ] Add cookie consent notice (if required)
- [ ] Display privacy policy and terms of service links

### 16. Performance Optimization

- [ ] Enable gzip/brotli compression
- [ ] Set up CDN for static assets (optional)
- [ ] Configure caching headers
- [ ] Optimize database indexes
- [ ] Set up connection pooling
- [ ] Enable HTTP/2

## Rollback Plan

If issues arise after deployment:

```bash
# PM2
pm2 stop amerilend
pm2 start amerilend --name amerilend-old

# Docker
docker stop amerilend
docker run <previous-image-tag>

# Database
mysql -u user -p database < backup-YYYY-MM-DD.sql
```

## Support Contacts

- Database issues: [Database admin contact]
- Payment gateway issues: Authorize.net Support, Coinbase Commerce Support
- Server/hosting issues: [Hosting provider support]
- Emergency contact: [On-call developer]

## Monitoring Dashboards

- Application: [Link to monitoring dashboard]
- Database: [Link to database monitoring]
- Logs: [Link to log aggregation]
- Uptime: [Link to uptime monitor]
- Errors: [Link to error tracking]

---

**Last Updated:** [Date]
**Deployed By:** [Name]
**Production URL:** https://yourdomain.com
