# HeyForm on Testudo GKE

HeyForm is deployed at `https://heyform.testudosrl.dev` in the dedicated
`heyform-dev` namespace of the `testudo-dev/europe-west1/tst-kube` cluster.

OpenTofu owns the reserved global IP and proxied Cloudflare DNS record. Its
state is stored in the existing `omnia-tfstate` GCS bucket under the isolated
`heyform/dev` prefix. Kubernetes owns the application, GCE Ingress, MongoDB,
KeyDB, uploads volume, and their persistent disks.

## Prerequisites

- `gcloud`, `kubectl`, `docker`, and `tofu`
- Google Cloud access to project `testudo-dev`
- a Cloudflare token with DNS edit access to `testudosrl.dev`

## Provision infrastructure

```bash
cd infra/environments/dev
export TF_VAR_cloudflare_zone_id='<zone-id>'
export TF_VAR_cloudflare_api_token='<token>'
tofu init
tofu apply
```

Never commit the Cloudflare token or `terraform.tfvars`.

## Build and push the application

```bash
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet
IMAGE="europe-west1-docker.pkg.dev/testudo-dev/docker-repo-dev/heyform:$(git rev-parse --short=12 HEAD)"
docker buildx build --platform linux/amd64 --push -t "$IMAGE" .
DIGEST="$(gcloud artifacts docker images describe "$IMAGE" \
  --project testudo-dev --format='value(image_summary.digest)')"
```

Update the HeyForm `digest` in `k8s/overlays/dev/kustomization.yaml` with
`$DIGEST` before applying. Workloads are pinned by digest so a mutable tag can
never silently change a running deployment.

## Deploy

```bash
gcloud container clusters get-credentials tst-kube \
  --region europe-west1 --project testudo-dev

kubectl create namespace heyform-dev --dry-run=client -o yaml | kubectl apply -f -

# First deployment only. Preserve this Secret on subsequent deployments:
# rotating either value invalidates sessions and may make encrypted form data
# unreadable.
if ! kubectl -n heyform-dev get secret heyform-secrets >/dev/null 2>&1; then
  kubectl -n heyform-dev create secret generic heyform-secrets \
    --from-literal=SESSION_KEY="$(openssl rand -hex 32)" \
    --from-literal=FORM_ENCRYPTION_KEY="$(openssl rand -hex 32)"
fi

# Email verification is disabled in this environment. If it is enabled later,
# add SMTP_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_SECURE
# to this Secret while preserving SESSION_KEY and FORM_ENCRYPTION_KEY.

kubectl apply -k k8s/overlays/dev
kubectl -n heyform-dev rollout status statefulset/mongo --timeout=10m
kubectl -n heyform-dev rollout status statefulset/keydb --timeout=10m
kubectl -n heyform-dev rollout status deployment/heyform --timeout=10m
```

Kubernetes does not restart a pod when a referenced Secret changes. After an
SMTP update, run `kubectl -n heyform-dev rollout restart deployment/heyform`
and wait for the rollout before testing mail delivery.

## Verification

```bash
kubectl -n heyform-dev get pods,pvc,ingress
curl -fsS https://heyform.testudosrl.dev/health/ready
```

Cloudflare terminates public HTTPS and proxies to the GCE HTTP load balancer,
matching the existing Omnia development deployment in the same Cloudflare
zone. MongoDB, KeyDB, and uploads use separate `standard-rwo` persistent
volumes; deleting the workload does not delete those claims. Network policies
allow MongoDB and KeyDB ingress only from the HeyForm application pods.

## Automatic deployment from GitHub

Every push to `main` runs `.github/workflows/deploy-main.yml`. The workflow follows the
same build/deploy separation used by Omnia:

1. run the HTTP/GraphQL server E2E suite;
2. build the production image and push commit and `main-latest` tags;
3. deploy the immutable build digest to `testudo-dev/europe-west1/tst-kube`;
4. wait for MongoDB, KeyDB, and HeyForm rollouts;
5. verify the Deployment digest and call the public `/health/ready` endpoint.

GitHub authenticates to Google Cloud through Workload Identity Federation. OpenTofu owns
the dedicated service account, OIDC provider, Artifact Registry writer binding, and GKE
deployment role. No Google service-account key is stored in GitHub. The repository variables
used by the workflow are non-sensitive identifiers:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GKE_CLUSTER`
- `GKE_NAMESPACE`
- `GAR_REPOSITORY`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `HEYFORM_SMOKE_URL`

The application encryption/session keys remain only in the existing Kubernetes
`heyform-secrets` Secret. The workflow verifies that Secret exists and deliberately never
creates or rotates it.
