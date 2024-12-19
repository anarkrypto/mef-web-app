import Bree from 'bree';
import Graceful from '@ladjs/graceful';
import logger from '@/logging';
import path from 'path';

const bree = new Bree({
  root: path.join(process.cwd(), 'dist', 'tasks'),
  jobs: [
    {
      name: 'ocv-vote-counting',
      path: path.join(process.cwd(), 'dist', 'tasks', 'ocv-vote-counting.js'),
      interval: '10m', // run every 10 minutes
      timeout: 0, // start immediatly when this script is run
      closeWorkerAfterMs: 9 * 60 * 1000 // Kill after 9 minutes if stuck
    }
  ],
  errorHandler: (error, workerMetadata) => {
    logger.error(`[Bree Runner] Worker ${workerMetadata.name} encountered an error:`, error);
  },
  workerMessageHandler: (message, workerMetadata) => {
    // empty intentionally
  }
});

const graceful = new Graceful({ brees: [bree] });
graceful.listen();

(async () => {
  await bree.start();
  logger.info('Bree started successfully');
})();
