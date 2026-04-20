#!/bin/bash
# Bootstrap script for a fresh Amazon Linux 2023 or Ubuntu 22.04 EC2 instance.
# Run once after SSH-ing in: bash setup.sh

set -e

echo "=== Git Visualiser — EC2 Setup ==="

# --- Detect OS ---
if grep -qi "Amazon Linux" /etc/os-release 2>/dev/null; then
    OS="amazon"
elif grep -qi "Ubuntu" /etc/os-release 2>/dev/null; then
    OS="ubuntu"
else
    echo "ERROR: Unsupported OS. Use Amazon Linux 2023 or Ubuntu 22.04." && exit 1
fi

# --- Install Docker ---
echo "[1/3] Installing Docker..."
if [ "$OS" = "amazon" ]; then
    sudo dnf update -y -q
    sudo dnf install -y docker git
    sudo systemctl enable --now docker
    sudo usermod -aG docker ec2-user
    CURRENT_USER="ec2-user"
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get update -y -q
    sudo apt-get install -y docker.io git
    sudo systemctl enable --now docker
    sudo usermod -aG docker ubuntu
    CURRENT_USER="ubuntu"
fi

# --- Install docker compose plugin (v2) ---
echo "[2/3] Installing docker compose plugin..."
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "[3/3] Verifying..."
docker --version
docker compose version

echo ""
echo "=== Setup complete ==="
echo ""
echo "IMPORTANT: Log out and back in so Docker group takes effect:"
echo "  exit"
echo "  ssh -i your-key.pem ${CURRENT_USER}@<EC2_PUBLIC_IP>"
echo ""
echo "Then clone the repo and follow deploy/STEPS.txt"
