variable "project_id" {
  description = "Google Cloud project hosting the GKE cluster and global IP."
  type        = string
  default     = "testudo-dev"
}

variable "region" {
  description = "Google Cloud region hosting the GKE cluster."
  type        = string
  default     = "europe-west1"
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for testudosrl.dev."
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS edit access to testudosrl.dev."
  type        = string
  sensitive   = true
}

variable "subdomain" {
  description = "Cloudflare record name relative to testudosrl.dev."
  type        = string
  default     = "heyform"
}

variable "artifact_registry_repository" {
  description = "Artifact Registry repository receiving HeyForm images."
  type        = string
  default     = "docker-repo-dev"
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy HeyForm."
  type        = string
  default     = "TestudoSrl/heyform"
}

variable "github_workload_identity_pool_id" {
  description = "Existing Google Workload Identity pool used by GitHub Actions."
  type        = string
  default     = "github-pool"
}
