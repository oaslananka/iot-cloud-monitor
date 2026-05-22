const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const workflowsDir = path.resolve('.github', 'workflows');
const shaPattern = /^[a-f0-9]{40}$/;
const mutableRefPattern = /@(?:v?\d+(?:\.\d+)?(?:\.\d+)?|main|master)$/;

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(workflowsDir)) {
  process.exit(0);
}

for (const fileName of fs.readdirSync(workflowsDir)) {
  if (!fileName.endsWith('.yml') && !fileName.endsWith('.yaml')) {
    continue;
  }

  const filePath = path.join(workflowsDir, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  const workflow = YAML.parse(source);

  if (!workflow.permissions) {
    fail(`${filePath}: workflow permissions must be explicit`);
  }
  if (!workflow.concurrency) {
    fail(`${filePath}: workflow concurrency must be configured`);
  }

  for (const [jobId, job] of Object.entries(workflow.jobs || {})) {
    if (!job['timeout-minutes']) {
      fail(`${filePath}: job ${jobId} must set timeout-minutes`);
    }
    if (job['runs-on'] === 'ubuntu-latest') {
      fail(`${filePath}: job ${jobId} must not use ubuntu-latest`);
    }

    for (const step of job.steps || []) {
      if (!step.uses) {
        continue;
      }
      const ref = String(step.uses).split('@')[1];
      if (!ref || !shaPattern.test(ref)) {
        fail(`${filePath}: ${step.uses} must be pinned to a full commit SHA`);
      }
      if (mutableRefPattern.test(step.uses)) {
        fail(`${filePath}: ${step.uses} must not use a mutable tag`);
      }
    }
  }
}
