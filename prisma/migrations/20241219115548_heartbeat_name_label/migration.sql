/*
  Warnings:

  - The primary key for the `WorkerHeartbeat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `jobId` on the `WorkerHeartbeat` table. All the data in the column will be lost.
  - The required column `id` was added to the `WorkerHeartbeat` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `WorkerHeartbeat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkerHeartbeat" DROP CONSTRAINT "WorkerHeartbeat_pkey",
DROP COLUMN "jobId",
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "name" VARCHAR(100) NOT NULL,
ADD CONSTRAINT "WorkerHeartbeat_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "WorkerHeartbeat_name_status_idx" ON "WorkerHeartbeat"("name", "status");
