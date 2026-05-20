<p align="center">
  <img src="../public/logo.png" width="72" alt="Retro14" /><br>
  <b>Retro14</b> &nbsp;·&nbsp; Collaborative retrospective tool for agile teams<br>
  <a href="../README.md">Overview</a> &nbsp;·&nbsp;
  <a href="FRONTEND.md">Frontend</a> &nbsp;·&nbsp;
  <a href="BACKEND.md">Backend</a> &nbsp;·&nbsp;
  <a href="DEPLOYMENT.md">Deployment</a> &nbsp;·&nbsp;
  <a href="DOCKER.md">Docker</a> &nbsp;·&nbsp;
  <a href="K8S.md">K8s</a>
</p>

---

# Kubernetes

Full self-hosted deployment — both the frontend and the entire Supabase backend run in the cluster. No Supabase Cloud, no external dependencies.

The Supabase stack (Postgres, Auth, PostgREST, Realtime, Kong) is deployed via the official Supabase Helm chart. The frontend connects to it over the internal cluster network.

## Layout

```
k8s/
├── namespace.yaml    # retro14 namespace — apply this first
├── secrets.yaml      # anon key + internal Supabase URL
├── frontend.yaml     # Deployment (2 replicas) + Service
└── ingress.yaml      # Nginx ingress with optional TLS
```

## Prerequisites

- A running K8s cluster (EKS, GKE, DigitalOcean, k3s, etc.)
- `kubectl` and `helm` configured against it
- Nginx ingress controller:
  ```bash
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
  ```

## 1. Deploy Supabase (Helm)

This runs the full Supabase stack inside the cluster — the same services as the Docker Compose setup.

```bash
helm repo add supabase https://supabase-community.github.io/supabase-kubernetes
helm repo update

helm install supabase supabase/supabase \
  --namespace retro14 \
  --create-namespace \
  --set secret.jwt.anonKey=<anon-key> \
  --set secret.jwt.serviceKey=<service-role-key> \
  --set secret.jwt.secret=<jwt-secret> \
  --set secret.db.password=<db-password> \
  --set studio.enabled=false
```

Generate the JWT keys the same way as the Docker setup — see [DOCKER.md](DOCKER.md#production-jwt-keys).

Wait for all pods to be ready:

```bash
kubectl get pods -n retro14 --watch
```

Supabase is accessible inside the cluster at:
`http://supabase-kong.retro14.svc.cluster.local:8000`

## 2. Apply schema

Once the DB pod is running, apply the schema files:

```bash
DB_POD=$(kubectl get pod -n retro14 -l app=supabase-db -o jsonpath='{.items[0].metadata.name}')

for f in supabase/schema/0{1,2,3,4,5}_*.sql; do
  kubectl exec -n retro14 $DB_POD -- psql -U postgres -d postgres -f /dev/stdin < $f
done
```

## 3. Deploy the frontend

Build and push the image with the internal Supabase URL baked in:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=http://supabase-kong.retro14.svc.cluster.local:8000 \
  --build-arg VITE_SUPABASE_ANON_KEY=<anon-key> \
  -t your-registry/retro14-app:latest .

docker push your-registry/retro14-app:latest
```

Update `image:` in `k8s/frontend.yaml` to `your-registry/retro14-app:latest`, then apply:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml   # update anon-key first
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml   # update host to your domain first
```

Check the rollout:

```bash
kubectl rollout status deployment/retro14-app -n retro14
kubectl get ingress -n retro14
```

## TLS

Install cert-manager, then uncomment the annotation and `tls` block in `k8s/ingress.yaml`:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

## Scaling

The frontend is stateless — scale freely:

```bash
kubectl scale deployment retro14-app --replicas=5 -n retro14
```

All state lives in the Supabase Postgres pod, so there are no caveats to scaling the frontend horizontally. For Postgres HA, configure the Helm chart with a primary/replica setup or use a managed Postgres (RDS, CloudSQL) as the database backend.
