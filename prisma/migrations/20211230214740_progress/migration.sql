/*
  Warnings:

  - You are about to drop the column `completed` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "completed",
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;
