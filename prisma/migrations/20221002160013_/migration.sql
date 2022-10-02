/*
  Warnings:

  - The values [PROCESSING,READY,ERROR] on the enum `SourceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SourceStatus_new" AS ENUM ('processing', 'ready', 'error');
ALTER TABLE "Source" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Source" ALTER COLUMN "status" TYPE "SourceStatus_new" USING ("status"::text::"SourceStatus_new");
ALTER TYPE "SourceStatus" RENAME TO "SourceStatus_old";
ALTER TYPE "SourceStatus_new" RENAME TO "SourceStatus";
DROP TYPE "SourceStatus_old";
ALTER TABLE "Source" ALTER COLUMN "status" SET DEFAULT 'processing';
COMMIT;

-- AlterTable
ALTER TABLE "Source" ALTER COLUMN "status" SET DEFAULT 'processing';
