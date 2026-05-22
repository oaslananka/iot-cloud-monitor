output "instance_id" {
  description = "Example API instance id."
  value       = aws_instance.api.id
}

output "security_group_id" {
  description = "Example API security group id."
  value       = aws_security_group.api.id
}
