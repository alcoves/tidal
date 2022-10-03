/*
  Warnings:

  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `inputUrl` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadata` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUri` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_videoId_fkey";

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "inputUrl" TEXT NOT NULL,
ADD COLUMN     "metadata" TEXT NOT NULL,
ADD COLUMN     "sourceUri" TEXT NOT NULL;

-- DropTable
DROP TABLE "Source";
