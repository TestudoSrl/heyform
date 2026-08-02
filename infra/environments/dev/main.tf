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
