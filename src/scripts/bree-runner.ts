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
      timeout: 0, // start immediately when this script is run
      closeWorkerAfterMs: 9 * 60 * 1000 // Kill after 9 minutes if stuck
    },
    {
      name: 'gpt-survey-processing',
      path: path.join(process.cwd(), 'dist', 'tasks', 'gpt-survey-processing.js'),
      // Remove interval since it will be run on-demand
      closeWorkerAfterMs: 9 * 60 * 1000 // Kill after 9 minutes if stuck
    }
  ],
  errorHandler: (error, workerMetadata) => {
    logger.error(`[Bree Runner] Worker ${workerMetadata.name} encountered an error:`, error);
  },
  workerMessageHandler: (message, workerMetadata) => {
    if (message === 'completed') {
      logger.info(`[Bree Runner] Worker ${workerMetadata.name} completed successfully`);
    }
  }
});

const graceful = new Graceful({ brees: [bree] });
graceful.listen();

// Export bree instance to be used by the API route
export default bree;

// Only start the OCV vote counting job if this file is being run directly
if (require.main === module) {
  (async () => {
    await bree.start('ocv-vote-counting');
    logger.info('Bree OCV vote counting started successfully');
  })();
}
