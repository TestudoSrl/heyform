output "hostname" {
  description = "Public HeyForm hostname."
  value       = cloudflare_record.heyform.hostname
}

output "static_ip" {
  description = "Reserved global address used by the GKE Ingress."
  value       = google_compute_global_address.heyform.address
}

output "static_ip_name" {
  description = "Reserved global address resource name."
  value       = google_compute_global_address.heyform.name
}

output "github_deployer_service_account" {
  description = "Service account impersonated by the HeyForm GitHub Actions workflow."
  value       = google_service_account.github_deployer.email
}

output "github_workload_identity_provider" {
  description = "Workload Identity provider resource name for GitHub OIDC authentication."
  value       = google_iam_workload_identity_pool_provider.github.name
}
