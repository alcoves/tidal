/*
  Warnings:

  - You are about to drop the column `sourceUri` on the `Video` table. All the data in the column will be lost.
  - Added the required column `s3Bucket` to the `Thumbnail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `Thumbnail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Bucket` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thumbnail" ADD COLUMN     "s3Bucket" TEXT NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "sourceUri",
ADD COLUMN     "s3Bucket" TEXT NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ALTER COLUMN "metadata" SET DEFAULT '';
