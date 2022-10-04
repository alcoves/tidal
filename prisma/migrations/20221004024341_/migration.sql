/*
  Warnings:

  - You are about to drop the column `input` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `s3Uri` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_thumbnailId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_transcodeId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_videoId_fkey";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "input",
DROP COLUMN "metadata",
DROP COLUMN "s3Uri";

-- DropTable
DROP TABLE "Job";

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "input" TEXT NOT NULL,
    "s3Uri" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '',
    "videoId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_videoId_key" ON "Source"("videoId");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
