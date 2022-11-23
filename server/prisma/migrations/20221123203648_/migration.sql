/*
  Warnings:

  - You are about to drop the `Playback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thumbnail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transcode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Playback" DROP CONSTRAINT "Playback_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Thumbnail" DROP CONSTRAINT "Thumbnail_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Transcode" DROP CONSTRAINT "Transcode_playbackId_fkey";

-- DropForeignKey
ALTER TABLE "Transcode" DROP CONSTRAINT "Transcode_videoId_fkey";

-- DropTable
DROP TABLE "Playback";

-- DropTable
DROP TABLE "Source";

-- DropTable
DROP TABLE "Thumbnail";

-- DropTable
DROP TABLE "Transcode";

-- CreateTable
CREATE TABLE "VideoInput" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "input" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "videoId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoInput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoInput_videoId_key" ON "VideoInput"("videoId");

-- AddForeignKey
ALTER TABLE "VideoInput" ADD CONSTRAINT "VideoInput_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
