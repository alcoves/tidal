/*
  Warnings:

  - You are about to drop the column `title` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Video` table. All the data in the column will be lost.
  - The `framerate` column on the `Video` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "framerate",
ADD COLUMN     "framerate" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "collectionId" SET DEFAULT E'',
ALTER COLUMN "thumbnailFilename" SET DEFAULT E'';
