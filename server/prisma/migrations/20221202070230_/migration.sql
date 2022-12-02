/*
  Warnings:

  - The values [PROXY] on the enum `VideoType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `VideoPlayback` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoType_new" AS ENUM ('ORIGINAL', 'ADAPTIVE', 'PROGRESSIVE');
ALTER TABLE "VideoFile" ALTER COLUMN "type" TYPE "VideoType_new" USING ("type"::text::"VideoType_new");
ALTER TYPE "VideoType" RENAME TO "VideoType_old";
ALTER TYPE "VideoType_new" RENAME TO "VideoType";
DROP TYPE "VideoType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "VideoPlayback" DROP CONSTRAINT "VideoPlayback_videoId_fkey";

-- DropIndex
DROP INDEX "VideoFile_videoId_key";

-- DropTable
DROP TABLE "VideoPlayback";

-- CreateTable
CREATE TABLE "VideoPackage" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "location" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VideoFileToVideoPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VideoFileToVideoPackage_AB_unique" ON "_VideoFileToVideoPackage"("A", "B");

-- CreateIndex
CREATE INDEX "_VideoFileToVideoPackage_B_index" ON "_VideoFileToVideoPackage"("B");

-- AddForeignKey
ALTER TABLE "VideoPackage" ADD CONSTRAINT "VideoPackage_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoFileToVideoPackage" ADD CONSTRAINT "_VideoFileToVideoPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "VideoFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoFileToVideoPackage" ADD CONSTRAINT "_VideoFileToVideoPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
