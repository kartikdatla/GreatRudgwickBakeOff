# Deployment Guide

## Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to a strong random value (minimum 32 characters)
- [ ] Set `NODE_ENV=production` in environment
- [ ] Review and update CORS settings for production domain
- [ ] Enable HTTPS/SSL certificate
- [ ] Review file upload limits and restrictions
- [ ] Disable debug logging in production

### Configuration
- [ ] Update API base URL in frontend (if different from /api)
- [ ] Configure email service (if implementing notifications)
- [ ] Set up backup strategy for database
- [ ] Configure log rotation
- [ ] Set up monitoring/alerting

### Testing
- [ ] Test all user roles (Admin, Baker, Judge, Spectator)
- [ ] Test complete monthly workflow
- [ ] Test file uploads with various image formats
- [ ] Test with multiple concurrent users
- [ ] Test on mobile devices
- [ ] Test error scenarios

## Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 16+ installed
- Nginx or Apache
- PM2 for process management
- Minimum 1GB RAM, 10GB storage

#### Steps

**1. Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

**2. Upload Code**
```bash
# Clone/upload your code to server
cd /var/www/
git clone <your-repo-url> bakeoff
cd bakeoff
```

**3. Setup Backend**
```bash
cd backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
PORT=5000
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
NODE_ENV=production
EOF

# Initialize database
npm run init-db

# Create admin user
npm run create-admin
```

**4. Build Frontend**
```bash
cd ../frontend
npm install
npm run build
```

**5. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/bakeoff
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (static files)
    location / {
        root /var/www/bakeoff/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/bakeoff /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**6. Start Backend with PM2**
```bash
cd /var/www/bakeoff/backend
pm2 start src/server.js --name bakeoff-api
pm2 save
pm2 startup
```

**7. Setup SSL (Optional but Recommended)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Cloud Platform (Heroku, DigitalOcean, AWS)

#### Heroku Deployment

**1. Install Heroku CLI**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

**2. Prepare Application**
```bash
# Create Procfile in root
echo "web: cd backend && npm start" > Procfile

# Create .gitignore if not exists
# Make sure node_modules, .env are ignored
```

**3. Deploy**
```bash
heroku create your-bakeoff-app
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production

git push heroku main

# Initialize database
heroku run npm run init-db --prefix backend

# Create admin
heroku run npm run create-admin --prefix backend
```

**4. Setup Domain (Optional)**
```bash
heroku domains:add your-domain.com
# Follow instructions to configure DNS
```

### Option 3: Docker Container

**Dockerfile (Backend)**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./

EXPOSE 5000

CMD ["npm", "start"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=7d
    volumes:
      - ./backend/database.sqlite:/app/database.sqlite
      - ./backend/uploads:/app/uploads
    restart: unless-stopped

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped
```

**Deploy with Docker**
```bash
# Build
docker-compose build

# Generate JWT secret
export JWT_SECRET=$(openssl rand -base64 32)

# Run
docker-compose up -d

# Initialize database
docker-compose exec backend npm run init-db

# Create admin
docker-compose exec backend npm run create-admin
```

## Post-Deployment Tasks

### 1. Database Backup Setup

**Create backup script** (`backup.sh`):
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/bakeoff"
DB_PATH="/var/www/bakeoff/backend/database.sqlite"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/database_$DATE.sqlite

# Keep only last 30 days of backups
find $BACKUP_DIR -name "database_*.sqlite" -mtime +30 -delete
```

**Schedule with cron**:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### 2. Monitoring Setup

**Install monitoring tools**:
```bash
# For PM2
pm2 install pm2-logrotate

# Setup monitoring dashboard
pm2 web
```

**Log locations**:
- PM2 logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- Application logs: Configure in your app

### 3. Performance Optimization

**Enable compression in Nginx**:
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

**Set up caching**:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 4. Security Hardening

**Firewall rules**:
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

**Update security headers in Nginx**:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## Maintenance

### Regular Updates

**Weekly**:
- Check application logs for errors
- Monitor disk space usage
- Review backup logs

**Monthly**:
- Update Node.js dependencies
- Review and update system packages
- Test backup restoration process

**Quarterly**:
- Security audit
- Performance review
- Update Node.js version if needed

### Scaling Considerations

**When to scale**:
- Response times > 2 seconds
- CPU usage consistently > 70%
- Memory usage > 80%
- More than 100 concurrent users

**Scaling options**:
1. **Vertical scaling**: Upgrade server resources
2. **Horizontal scaling**: Add load balancer + multiple instances
3. **Database scaling**: Move to PostgreSQL, add read replicas
4. **CDN**: Use Cloudflare or AWS CloudFront for static assets
5. **Object storage**: Move uploads to S3 or similar

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs bakeoff-api

# Check if port is in use
sudo lsof -i :5000

# Verify environment variables
pm2 env 0
```

### Database errors
```bash
# Check database file permissions
ls -la backend/database.sqlite

# Restore from backup
cp /backups/bakeoff/database_YYYYMMDD.sqlite backend/database.sqlite
pm2 restart bakeoff-api
```

### File upload issues
```bash
# Check uploads directory permissions
chmod 755 backend/uploads
chown -R www-data:www-data backend/uploads

# Check disk space
df -h
```

### High memory usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart bakeoff-api

# If persistent, increase server resources
```

## Rollback Procedure

If deployment fails:

1. **Restore previous version**:
```bash
git checkout <previous-commit>
pm2 restart bakeoff-api
```

2. **Restore database**:
```bash
cp /backups/bakeoff/database_<timestamp>.sqlite backend/database.sqlite
pm2 restart bakeoff-api
```

3. **Check logs and fix issues**:
```bash
pm2 logs bakeoff-api --lines 100
```

## Support Contacts

- **System Admin**: [contact details]
- **Database Admin**: [contact details]
- **Development Team**: [contact details]

---

**Deployment completed? Run through the Post-Deployment Checklist above!**
