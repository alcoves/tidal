/*
  Warnings:

  - Made the column `collectionId` on table `Video` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thumbnailFilename` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "collectionId" SET NOT NULL,
ALTER COLUMN "thumbnailFilename" SET NOT NULL;
