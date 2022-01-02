/*
  Warnings:

  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('CREATED', 'UPLOADED', 'PROCESSING', 'TRANSCODING', 'COMPLETED', 'ERROR', 'UPLOAD_FAILED');

-- DropTable
DROP TABLE "Job";

-- DropEnum
DROP TYPE "MediaStatus";

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'title',
    "length" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "views" BIGINT NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "framerate" TEXT NOT NULL DEFAULT E'',
    "status" "VideoStatus" NOT NULL DEFAULT E'CREATED',
    "collectionId" TEXT,
    "thumbnailFilename" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);
