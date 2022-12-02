/*
  Warnings:

  - You are about to drop the column `deleted` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `VideoFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VideoFile" DROP CONSTRAINT "VideoFile_videoId_fkey";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "deleted",
DROP COLUMN "location",
DROP COLUMN "status";

-- DropTable
DROP TABLE "VideoFile";

-- DropEnum
DROP TYPE "VideoFileType";

-- CreateTable
CREATE TABLE "Original" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Original_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playback" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thumbnail" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "s3Uri" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Original_videoId_key" ON "Original"("videoId");

-- AddForeignKey
ALTER TABLE "Original" ADD CONSTRAINT "Original_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playback" ADD CONSTRAINT "Playback_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thumbnail" ADD CONSTRAINT "Thumbnail_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
