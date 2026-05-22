const { createApp } = require('./app');
const { connectDB } = require('./config/db');
const { loadEnv } = require('./config/env');
const { createLogger } = require('./utils/logger');

async function start() {
  const config = loadEnv();
  const logger = createLogger(config);

  await connectDB(config.mongodbUri);
  const app = createApp(config);

  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'server_started');
  });

  return server;
}

if (require.main === module) {
  start().catch((error) => {
    console.error(JSON.stringify({ level: 'fatal', message: error.message }));
    process.exit(1);
  });
}

module.exports = { start };
