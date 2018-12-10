variable "project-id" {}
variable "bucket-name" {}
variable "function-name" {}
variable "function-handler" {}
variable "function-code-zipped-file" {}

provider "google" {
  project = "${var.project-id}"
  region = "europe-west1"
}

resource "google_redis_instance" "cache" {
  name           = "memory-cache"
  memory_size_gb = 1
}

resource "google_storage_bucket" "bucket" {
  name = "${var.bucket-name}"
}

resource "google_storage_bucket_object" "archive" {
  name = "function-${timestamp()}.zip"
  bucket = "${google_storage_bucket.bucket.name}"
  source = "${var.function-code-zipped-file}"
}

resource "google_cloudfunctions_function" "function" {
  name = "${var.function-name}"
  description = "The function ${var.function-name} is so cool!"
  available_memory_mb = 512
  source_archive_bucket = "${google_storage_bucket.bucket.name}"
  source_archive_object = "${google_storage_bucket_object.archive.name}"
  trigger_http = true
  timeout = 30
  entry_point = "${var.function-handler}"
  labels {
    version = "latest"
  }
  environment_variables {
    version = "latest"
    environment = "production"
    mem_host = "${google_redis_instance.cache.host}"
    mem_port = "${google_redis_instance.cache.port}"
  }
}

output "function-https-url" {
  value = "${google_cloudfunctions_function.function.https_trigger_url}"
}