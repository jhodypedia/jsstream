#!/bin/bash

echo "🛠 Menginstall JsStream..."

# Install dependencies
echo "📦 Update & install dependencies..."
pkg update -y && pkg upgrade -y
pkg install -y nodejs mariadb git wget curl unzip

# Install global npm packages
npm install -g nodemon

# Buat database
echo "📁 Membuat database MySQL..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS jsstream DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# Clone repo (jika dari GitHub, ganti URL-nya)
# git clone https://github.com/kamu/jsstream.git
# cd jsstream

# Setup env
echo "🔐 Membuat file .env..."
cat > .env <<EOF
SESSION_SECRET=jsstream_secret
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=jsstream
EMAIL_HOST=smtp.yourmail.com
EMAIL_USER=you@yourmail.com
EMAIL_PASS=yourpassword
EOF

# Install project dependencies
echo "📦 Menjalankan npm install..."
npm install

# Import database structure
echo "🗃 Mengimpor struktur database..."
mysql -u root jsstream < db.sql

# Jalankan server
echo "🚀 Menjalankan server dengan nodemon..."
npx nodemon server.js
