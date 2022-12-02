/*
  Warnings:

  - The values [ADAPTIVE,PROGRESSIVE] on the enum `VideoType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_VideoFileToVideoPackage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoType_new" AS ENUM ('PROXY', 'ORIGINAL');
ALTER TABLE "VideoFile" ALTER COLUMN "type" TYPE "VideoType_new" USING ("type"::text::"VideoType_new");
ALTER TYPE "VideoType" RENAME TO "VideoType_old";
ALTER TYPE "VideoType_new" RENAME TO "VideoType";
DROP TYPE "VideoType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_VideoFileToVideoPackage" DROP CONSTRAINT "_VideoFileToVideoPackage_A_fkey";

-- DropForeignKey
ALTER TABLE "_VideoFileToVideoPackage" DROP CONSTRAINT "_VideoFileToVideoPackage_B_fkey";

-- DropTable
DROP TABLE "_VideoFileToVideoPackage";
