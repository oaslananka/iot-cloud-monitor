const fs = require('node:fs');
const YAML = require('yaml');

const forbiddenWorkflowInputs = [
  'version',
  'release_version',
  'tag_name',
  'RELEASE_VERSION',
  'INPUT_VERSION'
];

const requiredFiles = [
  'release-please-config.json',
  '.release-please-manifest.json',
  'CHANGELOG.md'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} is required for release-managed repositories`);
  }
}

for (const workflowPath of fs.existsSync('.github/workflows')
  ? fs.readdirSync('.github/workflows').map((name) => `.github/workflows/${name}`)
  : []) {
  if (!workflowPath.endsWith('.yml') && !workflowPath.endsWith('.yaml')) {
    continue;
  }

  const workflow = YAML.parse(fs.readFileSync(workflowPath, 'utf8'));
  const dispatchInputs = workflow.on?.workflow_dispatch?.inputs || {};

  for (const inputName of Object.keys(dispatchInputs)) {
    if (forbiddenWorkflowInputs.includes(inputName)) {
      throw new Error(`${workflowPath}: manual release version input ${inputName} is forbidden`);
    }
  }
}
