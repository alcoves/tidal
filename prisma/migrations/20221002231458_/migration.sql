/*
  Warnings:

  - The `status` column on the `Source` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Video` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PROCESSING', 'READY', 'ERROR');

-- AlterTable
ALTER TABLE "Source" ALTER COLUMN "metadata" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PROCESSING';

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PROCESSING';

-- DropEnum
DROP TYPE "SourceStatus";

-- DropEnum
DROP TYPE "VideoStatus";
