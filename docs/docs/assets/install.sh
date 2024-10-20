#!/bin/bash

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions for colored output
success() {
  echo -e "${GREEN}[✔] $1${NC}"
}

info() {
  echo -e "${BLUE}[ℹ] $1${NC}"
}

warn() {
  echo -e "${YELLOW}[⚠] $1${NC}"
}

error() {
  echo -e "${RED}[✖] $1${NC}"
}

# Update package list
info "Updating package list..."
apt-get update && success "Package list updated."

# Add 'arcader' user
info "Creating 'arcader' user..."
useradd -m arcader && success "'arcader' user created."

# Install required packages
info "Installing required packages..."
apt-get install -y \
  sudo \
  xorg \
  chromium \
  openbox \
  lightdm \
  pipewire \
  pipewire-pulse \
  wireplumber \
  curl && success "Packages installed."

# Add arcader repository
info "Adding Arcader repository..."
curl -sSL https://arcader.hazdu.de/assets/arcader.sources > /etc/apt/sources.list.d/arcader.sources && success "Repository added."

# Update package list again
info "Updating package list after adding Arcader repository..."
apt-get update && success "Package list updated."

# LightDM configuration
info "Configuring LightDM for autologin..."
cat >>/etc/lightdm/lightdm.conf <<EOL
[SeatDefaults]
autologin-user=arcader
user-session=openbox
EOL
success "LightDM configured."

# Create Openbox autostart directory
info "Setting up Openbox autostart..."
mkdir -p /home/arcader/.config/openbox

# Ask user for environment variables or use default
read -p "Enter STEAMGRIDDB_API_KEY (or press Enter for default): " STEAMGRIDDB_API_KEY
STEAMGRIDDB_API_KEY=${STEAMGRIDDB_API_KEY:-YOUR_API_KEY}

read -p "Enter ADMIN_UI_PORT (default is 5328): " ADMIN_UI_PORT
ADMIN_UI_PORT=${ADMIN_UI_PORT:-5328}

read -p "Enter JOYSTICK_INDEX (default is 0): " JOYSTICK_INDEX
JOYSTICK_INDEX=${JOYSTICK_INDEX:-0}

read -p "Enter COIN_ACCEPTOR_PATH (default is /dev/ttyACM0): " COIN_ACCEPTOR_PATH
COIN_ACCEPTOR_PATH=${COIN_ACCEPTOR_PATH:-/dev/ttyACM0}

read -p "Disable coin slot? (true/false, default is false): " DISABLE_COIN_SLOT
DISABLE_COIN_SLOT=${DISABLE_COIN_SLOT:-false}

# Write Openbox autostart script
cat >/home/arcader/.config/openbox/autostart <<EOL
# Start audio drivers
pipewire &
pipewire-pulse &
wireplumber &

# Environment variables
export STEAMGRIDDB_API_KEY=$STEAMGRIDDB_API_KEY
export ADMIN_UI_PORT=$ADMIN_UI_PORT
export JOYSTICK_INDEX=$JOYSTICK_INDEX
export COIN_ACCEPTOR_PATH=$COIN_ACCEPTOR_PATH
export DISABLE_COIN_SLOT=$DISABLE_COIN_SLOT

# Start arcader software
arcader &
EOL
success "Openbox autostart configured."

# Set permissions for 'arcader' home directory
info "Setting permissions for 'arcader' user..."
chown arcader:arcader -R /home/arcader/ && success "Permissions set."

# Install Arcader
info "Installing Arcader..."
apt-get install -y arcader && success "Arcader installed."

info "Installation complete! 🎮 Enjoy your arcade experience!"