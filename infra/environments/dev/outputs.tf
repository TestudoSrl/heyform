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
