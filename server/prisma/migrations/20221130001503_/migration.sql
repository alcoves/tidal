/*
  Warnings:

  - You are about to drop the `VideoRendition` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VideoFileType" AS ENUM ('ORIGINAL', 'RENDITION');

-- DropForeignKey
ALTER TABLE "VideoRendition" DROP CONSTRAINT "VideoRendition_videoId_fkey";

-- DropTable
DROP TABLE "VideoRendition";

-- DropEnum
DROP TYPE "VideoRenditionType";

-- CreateTable
CREATE TABLE "VideoFile" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "input" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "type" "VideoFileType" NOT NULL,
    "videoId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoFile" ADD CONSTRAINT "VideoFile_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
