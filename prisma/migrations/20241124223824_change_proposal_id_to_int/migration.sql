-- First delete all existing proposals
DELETE FROM "Proposal";

/*
  Warnings:

  - The primary key for the `Proposal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Proposal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id");
