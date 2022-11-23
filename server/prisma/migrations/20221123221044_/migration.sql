/*
  Warnings:

  - Added the required column `location` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VideoInput" DROP CONSTRAINT "VideoInput_videoId_fkey";

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "location" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "VideoInput" ADD CONSTRAINT "VideoInput_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
