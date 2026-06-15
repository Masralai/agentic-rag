#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-psynapse}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

info()  { echo -e "\033[1;34m•\033[0m $*"; }
ok()    { echo -e "\033[1;32m✓\033[0m $*"; }
err()   { echo -e "\033[1;31m✗\033[0m $*"; exit 1; }

info "Creating Kind cluster '$CLUSTER_NAME'..."
if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  ok "Cluster '$CLUSTER_NAME' already exists"
else
  kind create cluster --name "$CLUSTER_NAME" || err "Failed to create cluster"
  ok "Cluster '$CLUSTER_NAME' created"
fi

info "Installing nginx-ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-ginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s 2>/dev/null || \
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s || err "ingress-nginx failed to start"
ok "ingress-nginx ready"

info "Building Docker image..."
docker build -t "psynapse:${IMAGE_TAG}" . || err "Docker build failed"
ok "Image built: psynapse:${IMAGE_TAG}"

info "Loading image into Kind..."
kind load docker-image "psynapse:${IMAGE_TAG}" --name "$CLUSTER_NAME" || err "Failed to load image"
ok "Image loaded into Kind"

info "Checking .env exists..."
if [ ! -f .env ]; then
  err ".env file not found. Copy .env.example to .env and fill in credentials first."
fi
ok ".env found"

info "Copying .env for kustomize..."
cp .env k8s/.env.k8s
ok "Copied"

info "Deploying to Kind..."
kubectl apply -k k8s/ || err "Failed to apply manifests"
ok "Deployment applied"

info "Waiting for rollout to complete..."
kubectl -n psynapse rollout status deployment/psynapse --timeout=120s || err "Rollout failed"
ok "Rollout complete"

info "Cleaning up..."
rm -f k8s/.env.k8s
ok "Cleaned up temp files"

info "Getting pod status..."
kubectl -n psynapse get pods

echo ""
echo "======"
echo "Deploy complete!"
echo ""
echo "Access via ingress: http://psynapse.127.0.0.1.nip.io"
echo ""
echo "Or via port-forward:"
echo "  kubectl -n psynapse port-forward deploy/psynapse 3000:3000"
echo ""
echo "Tip: run 'curl -s http://psynapse.127.0.0.1.nip.io/api/health' to test"
echo ""
echo "For code changes, run:"
echo "  bash scripts/dev.sh"
echo "======"
