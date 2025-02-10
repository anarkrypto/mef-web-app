import { parentPort, workerData } from 'worker_threads';
import prisma from '@/lib/prisma';
import { GptSurveyClient } from '@/lib/gpt-survey/client';
import { GptSurveyService } from '@/services/GptSurveyService';
import { GptSurveyRunner } from '@/lib/gpt-survey/runner';
import logger from '@/logging';
import { WorkerStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

let isRunning = true;

// Handle cancellation
if (parentPort) {
  parentPort.once('message', async (message) => {
    if (message === 'cancel') {
      isRunning = false;
      logger.info('Received cancel signal, cleaning up...');
      
      // Update any running jobs to failed status
      await prisma.workerHeartbeat.updateMany({
        where: {
          name: 'gpt-survey-processor',
          status: WorkerStatus.RUNNING
        },
        data: {
          status: WorkerStatus.FAILED,
          metadata: {
            error: "Job was forcefully terminated",
            killedAt: new Date().toISOString()
          }
        }
      });

      // Signal that we're done
      parentPort?.postMessage('cancelled');
      process.exit(0);
    }
  });
}

type JsonValue = string | number | boolean | { [key: string]: JsonValue } | JsonValue[];

interface WorkerMetadata {
  roundId: string;
  forceSummary: boolean;
  startedAt: string;
  processed_proposals?: Array<{
    id: number;
    hasSummary: boolean;
  }>;
  error?: string;
  killedAt?: string;
}

const LOCK_KEY = 'gpt_survey_processing_job';
const PROCESS_PROPOSALS_HEARTBEAT_INTERVAL = 5000;
const WORKER_NAME = 'gpt-survey-processor';

// Lock management functions
async function isLockAcquired(): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ pg_try_advisory_lock: boolean }>>`
    SELECT pg_try_advisory_lock(hashtext(${LOCK_KEY})) as pg_try_advisory_lock
  `;
  return result[0]?.pg_try_advisory_lock ?? false;
}

async function releaseLock(): Promise<void> {
  await prisma.$queryRaw`
    SELECT pg_advisory_unlock(hashtext(${LOCK_KEY}))
  `;
}

async function updateHeartbeat(
  id: string,
  status: WorkerStatus,
  metadata?: WorkerMetadata
) {
  await prisma.workerHeartbeat.upsert({
    where: { id },
    create: {
      id,
      name: WORKER_NAME,
      status,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
    },
    update: {
      lastHeartbeat: new Date(),
      status,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
    }
  });
}

async function processGptSurvey() {
  try {
    // Clean up stale jobs (older than 9 minutes)
    await prisma.workerHeartbeat.deleteMany({
      where: {
        name: 'gpt-survey-processor',
        status: WorkerStatus.RUNNING,
        lastHeartbeat: {
          lt: new Date(Date.now() - 9 * 60 * 1000)
        }
      }
    });

    // Get the current job metadata
    const currentJob = await prisma.workerHeartbeat.findFirst({
      where: {
        name: 'gpt-survey-processor',
        status: WorkerStatus.RUNNING,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!currentJob?.metadata) {
      throw new Error('No job metadata found');
    }

    const metadata = currentJob.metadata as unknown as WorkerMetadata;

    const { PGT_GSS_API_URL, PGT_GSS_API_TOKEN } = workerData as { 
      PGT_GSS_API_URL: string; 
      PGT_GSS_API_TOKEN: string; 
    };

    if (!PGT_GSS_API_URL || !PGT_GSS_API_TOKEN) {
      throw new Error('Missing required environment variables for GPT Survey client');
    }

    const client = new GptSurveyClient({
      baseUrl: PGT_GSS_API_URL,
      authSecret: PGT_GSS_API_TOKEN
    });
    
    const service = new GptSurveyService();
    const runner = new GptSurveyRunner(client, service);

    // Check if we've been cancelled before starting the main work
    if (!isRunning) {
      throw new Error('Job was cancelled before processing started');
    }

    const results = await runner.processFundingRound(metadata.roundId, metadata.forceSummary);

    // Check if we've been cancelled after processing
    if (!isRunning) {
      throw new Error('Job was cancelled during processing');
    }

    // Update job status to completed
    const updatedMetadata: Prisma.JsonObject = {
      ...metadata,
      processed_proposals: results.map(r => ({
        id: r.proposalId,
        hasSummary: !!r.summary
      }))
    };

    await prisma.workerHeartbeat.update({
      where: { id: currentJob.id },
      data: {
        status: WorkerStatus.COMPLETED,
        metadata: updatedMetadata
      }
    });

    if (parentPort) parentPort.postMessage('completed');
    else process.exit(0);
  } catch (error) {
    logger.error('Error in GPT Survey processing:', error);

    // Update job status to failed
    const failedMetadata: Prisma.JsonObject = {
      roundId: '',
      forceSummary: false,
      startedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      killedAt: new Date().toISOString()
    };

    await prisma.workerHeartbeat.updateMany({
      where: {
        name: 'gpt-survey-processor',
        status: WorkerStatus.RUNNING
      },
      data: {
        status: WorkerStatus.FAILED,
        metadata: failedMetadata
      }
    });

    if (parentPort) parentPort.postMessage('failed');
    else process.exit(1);
  }
}

async function main() {
  try {
    await processGptSurvey();
  } catch (error) {
    logger.error('[GPT Survey Processing] Error in main:', error);
    process.exit(1);
  }
}

main(); 