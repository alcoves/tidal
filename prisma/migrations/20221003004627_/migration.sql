/*
  Warnings:

  - You are about to drop the column `s3Key` on the `Source` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Source` table. All the data in the column will be lost.
  - You are about to drop the column `latest` on the `Thumbnail` table. All the data in the column will be lost.
  - Added the required column `inputUrl` to the `Source` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uri` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Source" DROP COLUMN "s3Key",
DROP COLUMN "url",
ADD COLUMN     "inputUrl" TEXT NOT NULL,
ADD COLUMN     "uri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Thumbnail" DROP COLUMN "latest";
