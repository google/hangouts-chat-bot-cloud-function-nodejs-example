provider "google" {
  //   credentials = //injected from the environment. Read https://cloud.google.com/docs/authentication/production
}

variable "project-name" {
  default = "My First Project"
}

variable "project-id" {
  default = "sound-datum-210112"
}

variable "organization-id" {
  default = "87938239669"
}

module "project" {
  source = "./modules/project"

  name = "${var.project-name}"
  project-id = "${var.project-id}"
  org-id = "${var.organization-id}"
}


module "function" {
  source = "./modules/function"

  project-id = "${module.project.project-identifier}"
  bucket-name = "${module.project.project-identifier}-code-bucket"
  function-name = "${module.project.project-identifier}-cf-fct"
  function-handler = "handler"
  function-code-zipped-file = "../../output/nodejs/function.zip"
}

output "function-https-url" {
  value = "${module.function.function-https-url}"
}