-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('processing', 'ready', 'error');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'processing';
