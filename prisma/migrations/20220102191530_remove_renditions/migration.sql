/*
  Warnings:

  - You are about to drop the `Rendition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rendition" DROP CONSTRAINT "Rendition_videoId_fkey";

-- DropTable
DROP TABLE "Rendition";

-- DropEnum
DROP TYPE "RenditionStatus";
