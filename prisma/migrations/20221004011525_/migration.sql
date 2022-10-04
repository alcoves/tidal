/*
  Warnings:

  - A unique constraint covering the columns `[thumbnailId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transcodeId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[videoId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "thumbnailId" TEXT,
ADD COLUMN     "transcodeId" TEXT,
ADD COLUMN     "videoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Job_thumbnailId_key" ON "Job"("thumbnailId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_transcodeId_key" ON "Job"("transcodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_videoId_key" ON "Job"("videoId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Thumbnail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_transcodeId_fkey" FOREIGN KEY ("transcodeId") REFERENCES "Transcode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
