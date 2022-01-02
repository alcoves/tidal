/*
  Warnings:

  - The values [PROCESSING,UPLOAD_FAILED] on the enum `VideoStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoStatus_new" AS ENUM ('CREATED', 'UPLOADED', 'TRANSCODING', 'COMPLETED', 'ERROR');
ALTER TABLE "Video" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Video" ALTER COLUMN "status" TYPE "VideoStatus_new" USING ("status"::text::"VideoStatus_new");
ALTER TYPE "VideoStatus" RENAME TO "VideoStatus_old";
ALTER TYPE "VideoStatus_new" RENAME TO "VideoStatus";
DROP TYPE "VideoStatus_old";
ALTER TABLE "Video" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;
