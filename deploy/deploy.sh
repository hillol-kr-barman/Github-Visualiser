#!/bin/bash
# Script to run from local machine to deploy latest code to EC2.
# Usage: bash deploy/deploy.sh

set -e

EC2_USER="ec2-user"
EC2_HOST="13.55.60.149"
EC2_KEY="$HOME/.ssh/github-visualiser-aws-key.pem"
REPO_DIR="Github-Visualiser"

echo "=== Deploying to EC2 ==="

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" bash <<EOF
  set -e
  cd ~/$REPO_DIR
  echo "[1/3] Pulling latest code..."
  git pull
  echo "[2/3] Rebuilding and restarting containers..."
  docker compose up -d --build
  echo "[3/3] Status:"
  docker compose ps
EOF

echo ""
echo "=== Done — http://$EC2_HOST:8080 ==="
