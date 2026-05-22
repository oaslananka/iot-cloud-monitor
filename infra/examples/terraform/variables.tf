variable "aws_region" {
  description = "AWS region for the example deployment."
  type        = string
  default     = "us-west-2"
}

variable "vpc_id" {
  description = "VPC id for the example API instance."
  type        = string
}

variable "subnet_id" {
  description = "Private subnet id for the example API instance."
  type        = string
}

variable "allowed_api_cidrs" {
  description = "CIDR ranges allowed to reach the API port in this example."
  type        = list(string)
  default     = []
}

variable "instance_type" {
  description = "EC2 instance type for the example API instance."
  type        = string
  default     = "t3.micro"
}
