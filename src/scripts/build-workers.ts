/**
 * Build Script for Bree.js Workers
 * 
 * This script compiles TypeScript worker files into JavaScript for use with Bree.js job scheduler.
 * It's necessary because:
 * 
 * 1. Bree.js workers run in separate threads using Node.js worker_threads
 * 2. Worker files need to be compiled from TypeScript to JavaScript before execution
 * 3. Workers need special ESM handling since our project uses "type": "module"
 * 
 * Project Structure:
 * - Source workers are in src/tasks/*.ts
 * - Compiled workers are output to dist/tasks/*.js
 * 
 * Worker Configuration:
 * - Workers are initialized in src/app/api/proposals/[id]/submit/route.ts
 * - Bree is configured to look for workers in dist/tasks/
 * - Each worker runs in isolation with its own dependencies
 * 
 * Build Process:
 * 1. Bundles each worker file with its dependencies
 * 2. Adds ESM compatibility layer via banner
 * 3. Outputs compiled files to dist/tasks/
 * 
 * @example
 * # Build workers (usually run as part of npm run build)
 * npm run build:workers
 */

import logger from '@/logging'
import * as esbuild from 'esbuild'

async function buildWorkers() {
  try {
    await esbuild.build({
      entryPoints: ['src/tasks/*.ts', 'src/scripts/bree-runner.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outdir: 'dist/',
      format: 'esm',
      banner: {
        js: `
          import { createRequire } from 'module';
          import { fileURLToPath } from 'url';
          import { dirname } from 'path';
          const require = createRequire(import.meta.url);
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);
        `
      }
    })
    logger.debug('Workers built successfully!')
  } catch (error) {
    logger.error('Worker build failed:', error)
    process.exit(1)
  }
}

buildWorkers()