-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('STARTING', 'DOWNLOADING', 'INSPECTING', 'READY', 'ERROR');

-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "status" "SourceStatus" NOT NULL DEFAULT 'STARTING';
