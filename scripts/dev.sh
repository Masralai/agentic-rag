#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-psynapse}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

info()  { echo -e "\033[1;34m•\033[0m $*"; }
ok()    { echo -e "\033[1;32m✓\033[0m $*"; }
err()   { echo -e "\033[1;31m✗\033[0m $*"; exit 1; }

info "Building Docker image..."
docker build -t "psynapse:${IMAGE_TAG}" . || err "Docker build failed"
ok "Image built: psynapse:${IMAGE_TAG}"

info "Loading image into Kind..."
kind load docker-image "psynapse:${IMAGE_TAG}" --name "$CLUSTER_NAME" || err "Failed to load image"
ok "Image loaded into Kind"

info "Restarting deployment..."
kubectl -n psynapse rollout restart deploy/psynapse || err "Failed to restart"
ok "Deployment restarted"

info "Waiting for rollout to complete..."
kubectl -n psynapse rollout status deployment/psynapse --timeout=120s || err "Rollout failed"
ok "Rollout complete"

info "Getting pod status..."
kubectl -n psynapse get pods

echo ""
echo "======"
echo "Dev cycle complete."
echo "======"
