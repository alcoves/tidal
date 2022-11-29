/*
  Warnings:

  - You are about to drop the `VideoInput` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VideoRenditionType" AS ENUM ('ORIGINAL', 'MEZZANINE', 'OTHER');

-- DropForeignKey
ALTER TABLE "VideoInput" DROP CONSTRAINT "VideoInput_videoId_fkey";

-- DropTable
DROP TABLE "VideoInput";

-- CreateTable
CREATE TABLE "VideoRendition" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "input" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "metadata" JSONB,
    "type" "VideoRenditionType" NOT NULL,
    "videoId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoRendition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoRendition_videoId_key" ON "VideoRendition"("videoId");

-- AddForeignKey
ALTER TABLE "VideoRendition" ADD CONSTRAINT "VideoRendition_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
