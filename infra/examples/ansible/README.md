# Ansible Example

This example shows a systemd service layout for a Node.js API host. It assumes Node.js 24 and pnpm are already installed by an approved base-image or host bootstrap process.

Runtime secrets should be provided in the environment file referenced by `iot_cloud_monitor_env_file`. Do not store secret values in inventory or playbooks.
