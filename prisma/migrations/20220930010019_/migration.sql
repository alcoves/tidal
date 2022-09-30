/*
  Warnings:

  - You are about to drop the column `input` on the `Video` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SourceAssetType" AS ENUM ('ORIGINAL', 'MEZZANINE');

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "input";

-- CreateTable
CREATE TABLE "SourceAsset" (
    "id" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "type" "SourceAssetType" NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "SourceAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SourceAsset" ADD CONSTRAINT "SourceAsset_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
