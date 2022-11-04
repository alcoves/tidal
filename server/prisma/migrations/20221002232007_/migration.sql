/*
  Warnings:

  - You are about to drop the column `s3Bucket` on the `Source` table. All the data in the column will be lost.
  - Made the column `metadata` on table `Source` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Source" DROP COLUMN "s3Bucket",
ALTER COLUMN "metadata" SET NOT NULL,
ALTER COLUMN "metadata" SET DEFAULT '';
