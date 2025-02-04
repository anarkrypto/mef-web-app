import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import logger from "@/logging";
import prisma from "@/lib/prisma";
import { WorkerStatus } from "@prisma/client";
import bree from "@/scripts/bree-runner";

export async function POST(request: NextRequest) {
  try {
    // Find any running jobs
    const runningJobs = await prisma.workerHeartbeat.findMany({
      where: {
        name: 'gpt-survey-processor',
        status: WorkerStatus.RUNNING,
      }
    });

    if (runningJobs.length === 0) {
      throw new AppError("No running jobs found", 404);
    }

    // Get the worker instance
    const worker = bree.workers.get('gpt-survey-processing');
    if (!worker) {
      logger.warn("No active worker found in Bree, but database shows running jobs");
    } else {
      // Send cancel message to worker
      worker.postMessage('cancel');

      // Wait for a short time for the worker to clean up
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force terminate if still running
      if (worker.threadId) {
        worker.terminate();
      }
    }

    // Stop the Bree job
    await bree.stop('gpt-survey-processing');

    // Update all running jobs to FAILED status (in case worker didn't do it)
    await prisma.workerHeartbeat.updateMany({
      where: {
        name: 'gpt-survey-processor',
        status: WorkerStatus.RUNNING,
      },
      data: {
        status: WorkerStatus.FAILED,
        metadata: {
          error: "Job was forcefully terminated",
          killedAt: new Date().toISOString()
        }
      }
    });

    return ApiResponse.success({
      message: "GPT Survey processing job killed",
      killedJobs: runningJobs.length
    });
  } catch (error) {
    logger.error("Error killing GPT Survey job:", error);
    return ApiResponse.error(error);
  }
} 