# Terraform Example

This example is a starting point for an EC2-based staging environment. It is not a complete production deployment.

It intentionally does not use `remote-exec` for application deployment. Build, release, and service lifecycle should be handled by CI and a service manager or container runtime.

Required operator inputs:

- `aws_region`
- `vpc_id`
- `subnet_id`
- `allowed_api_cidrs`

Do not put secrets in Terraform variables or state.
