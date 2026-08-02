terraform {
  backend "gcs" {
    bucket = "omnia-tfstate"
    prefix = "heyform/dev"
  }
}
