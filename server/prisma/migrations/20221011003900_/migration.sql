/*
  Warnings:

  - Added the required column `videoId` to the `Playback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Playback" ADD COLUMN     "videoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Playback" ADD CONSTRAINT "Playback_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
