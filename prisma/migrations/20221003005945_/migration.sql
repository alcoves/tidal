/*
  Warnings:

  - You are about to drop the column `s3Bucket` on the `Thumbnail` table. All the data in the column will be lost.
  - You are about to drop the column `s3Key` on the `Thumbnail` table. All the data in the column will be lost.
  - You are about to drop the column `s3Bucket` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `s3Key` on the `Video` table. All the data in the column will be lost.
  - Added the required column `s3Uri` to the `Thumbnail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Uri` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thumbnail" DROP COLUMN "s3Bucket",
DROP COLUMN "s3Key",
ADD COLUMN     "s3Uri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "s3Bucket",
DROP COLUMN "s3Key",
ADD COLUMN     "s3Uri" TEXT NOT NULL;
