/*
  Warnings:

  - You are about to drop the `VideoOriginal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoProxy` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('PROXY', 'ORIGINAL');

-- DropForeignKey
ALTER TABLE "VideoOriginal" DROP CONSTRAINT "VideoOriginal_videoId_fkey";

-- DropForeignKey
ALTER TABLE "VideoProxy" DROP CONSTRAINT "VideoProxy_videoId_fkey";

-- DropTable
DROP TABLE "VideoOriginal";

-- DropTable
DROP TABLE "VideoProxy";

-- CreateTable
CREATE TABLE "VideoFile" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "type" "VideoType" NOT NULL,
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoFile_videoId_key" ON "VideoFile"("videoId");

-- AddForeignKey
ALTER TABLE "VideoFile" ADD CONSTRAINT "VideoFile_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
