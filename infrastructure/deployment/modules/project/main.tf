variable "name" {}
variable "project-id" {}
variable "org-id" {}

/*
resource "google_project" "capacitybot-project" {
  name = "${var.name}"
  project_id = "${var.project-id}"
  org_id = "${var.org-id}"
}
*/

output "project-identifier" {
//  value = "${google_project.capacitybot-project.project_id}"
  value = "${var.project-id}"
}