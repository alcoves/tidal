/*
  Warnings:

  - You are about to drop the `Original` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Playback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thumbnail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Original" DROP CONSTRAINT "Original_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Playback" DROP CONSTRAINT "Playback_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Thumbnail" DROP CONSTRAINT "Thumbnail_videoId_fkey";

-- DropTable
DROP TABLE "Original";

-- DropTable
DROP TABLE "Playback";

-- DropTable
DROP TABLE "Thumbnail";

-- CreateTable
CREATE TABLE "VideoOriginal" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoOriginal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProxy" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoProxy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoPlayback" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoPlayback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoThumbnail" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoThumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoOriginal_videoId_key" ON "VideoOriginal"("videoId");

-- AddForeignKey
ALTER TABLE "VideoOriginal" ADD CONSTRAINT "VideoOriginal_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProxy" ADD CONSTRAINT "VideoProxy_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPlayback" ADD CONSTRAINT "VideoPlayback_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoThumbnail" ADD CONSTRAINT "VideoThumbnail_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
