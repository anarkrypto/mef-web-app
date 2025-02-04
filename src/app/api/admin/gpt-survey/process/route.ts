import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import logger from "@/logging";
import prisma from "@/lib/prisma";
import { WorkerStatus } from "@prisma/client";
import bree from "@/scripts/bree-runner";

export async function POST(request: NextRequest) {
  try {
    // Check if a job is already running
    const runningJob = await prisma.workerHeartbeat.findFirst({
      where: {
        name: 'gpt-survey-processor',
        status: WorkerStatus.RUNNING,
        lastHeartbeat: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
        }
      }
    });

    if (runningJob) {
      throw new AppError(
        "A GPT Survey processing job is already running. Please wait for it to complete.",
        409
      );
    }

    // Parse request body
    const body = await request.json();
    const { roundId, forceSummary } = body;

    if (!roundId) {
      throw new AppError("Missing roundId", 400);
    }

    // Store the parameters in the worker metadata
    await prisma.workerHeartbeat.create({
      data: {
        name: 'gpt-survey-processor',
        status: WorkerStatus.RUNNING,
        metadata: {
          roundId,
          forceSummary: forceSummary || false,
          startedAt: new Date().toISOString()
        }
      }
    });

    // Start the worker asynchronously
    bree.run('gpt-survey-processing').catch(error => {
      logger.error("Failed to start GPT Survey processing job:", error);
    });

    // Get the most recent completed job execution for status context
    const lastJob = await prisma.workerHeartbeat.findFirst({
      where: {
        name: 'gpt-survey-processor',
        status: {
          in: [WorkerStatus.COMPLETED, WorkerStatus.FAILED]
        }
      },
      orderBy: {
        lastHeartbeat: 'desc'
      }
    });

    return ApiResponse.success({
      message: "GPT Survey processing started",
      lastExecution: lastJob ? {
        status: lastJob.status,
        timestamp: lastJob.lastHeartbeat,
        metadata: lastJob.metadata
      } : null
    });
  } catch (error) {
    logger.error("Error processing GPT Survey request:", error);
    return ApiResponse.error(error);
  }
} 