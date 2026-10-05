# Infrastructure Example Instructions

These instructions apply to `infra/**` and supplement the repository root instructions.

## Scope

The Terraform and Ansible material in this repository is example/reference infrastructure. It is not the project's production deployment system.

## Rules

- Do not present examples as production-ready automation.
- Keep secrets and environment-specific values out of committed variables, inventory, playbooks, and state examples.
- Terraform examples should avoid embedding application deployment through ad hoc remote execution.
- Ansible examples should remain generic host/service examples and should not assume an undocumented production topology.
- Do not add provider-specific production claims unless the repository explicitly adopts and documents that provider/deployment contract.
- Keep examples internally valid and aligned with the documented Node/runtime expectations.

## Validation

Validate syntax and formatting with the repository's existing checks where available. Example validation is not evidence that production infrastructure exists or has been deployed.
