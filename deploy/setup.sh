#!/bin/bash
# Server setup script for Great Rudgwick Bake Off
# Run on a fresh Ubuntu VPS (DigitalOcean, Hetzner, etc.)
# Usage: bash setup.sh

set -e

APP_DIR="/var/www/bakeoff"
REPO_URL="https://github.com/kartikdatla/GreatRudgwickBakeOff.git"
DOMAIN="kartik.uk"

echo "=== Great Rudgwick Bake Off - Server Setup ==="

# 1. Install Node.js 20
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install Nginx & Certbot
echo "Installing Nginx and Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 3. Install PM2 (process manager)
echo "Installing PM2..."
sudo npm install -g pm2

# 4. Clone the repo
echo "Cloning repository..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

# 5. Install dependencies
echo "Installing dependencies..."
cd backend && npm install --production && cd ..
cd frontend && npm install && cd ..

# 6. Build frontend
echo "Building frontend..."
cd frontend && VITE_BASE_PATH=/bakeoff npm run build && cd ..

# 7. Create backend .env
echo "Setting up environment..."
if [ ! -f backend/.env ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  cat > backend/.env << EOF
NODE_ENV=production
PORT=5001
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
EOF
  echo "Created backend/.env with random JWT secret"
fi

# 8. Ensure uploads directory exists
mkdir -p backend/uploads

# 9. Initialize database
echo "Initializing database..."
cd backend && npm run init-db && npm run migrate && cd ..

# 10. Setup Nginx
echo "Configuring Nginx..."
sudo cp deploy/nginx-bakeoff.conf /etc/nginx/sites-available/bakeoff
sudo ln -sf /etc/nginx/sites-available/bakeoff /etc/nginx/sites-enabled/bakeoff
sudo nginx -t && sudo systemctl reload nginx

# 11. SSL Certificate
echo "Setting up SSL..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m drkdatla@gmail.com

# 12. Start with PM2
echo "Starting application..."
cd $APP_DIR
pm2 start backend/src/server.js --name bakeoff --env production
pm2 save
pm2 startup

echo ""
echo "=== Setup Complete ==="
echo "App is live at: https://$DOMAIN/bakeoff/"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs bakeoff    - View logs"
echo "  pm2 restart bakeoff - Restart app"
echo ""
echo "To deploy updates:"
echo "  cd $APP_DIR && git pull && cd frontend && VITE_BASE_PATH=/bakeoff npm run build && cd .. && pm2 restart bakeoff"
