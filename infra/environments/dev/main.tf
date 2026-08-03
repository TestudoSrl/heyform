resource "google_compute_global_address" "heyform" {
  project = var.project_id
  name    = "heyform-dev-ip"
}

resource "cloudflare_record" "heyform" {
  zone_id = var.cloudflare_zone_id
  name    = var.subdomain
  content = google_compute_global_address.heyform.address
  type    = "A"
  proxied = true
  ttl     = 1
}

data "google_project" "current" {
  project_id = var.project_id
}

resource "google_service_account" "github_deployer" {
  project      = var.project_id
  account_id   = "heyform-github-deploy"
  display_name = "HeyForm GitHub Actions deployer"
  description  = "Builds HeyForm images and deploys them to tst-kube from TestudoSrl/heyform main."
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = var.github_workload_identity_pool_id
  workload_identity_pool_provider_id = "heyform-provider"
  display_name                       = "GitHub OIDC — HeyForm"
  description                        = "Accepts GitHub OIDC tokens only from TestudoSrl/heyform main."

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  attribute_condition = "assertion.repository == '${var.github_repository}' && assertion.ref == 'refs/heads/main'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_workload_identity" {
  service_account_id = google_service_account.github_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.current.number}/locations/global/workloadIdentityPools/${var.github_workload_identity_pool_id}/attribute.repository/${var.github_repository}"
}

resource "google_project_iam_member" "github_gke_deployer" {
  project = var.project_id
  role    = "roles/container.developer"
  member  = "serviceAccount:${google_service_account.github_deployer.email}"
}

resource "google_artifact_registry_repository_iam_member" "github_artifact_writer" {
  project    = var.project_id
  location   = var.region
  repository = var.artifact_registry_repository
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.github_deployer.email}"
}
