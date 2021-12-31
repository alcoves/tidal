/*
  Warnings:

  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Video";

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT E'CREATED',
    "completed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cmd" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalId_key" ON "Job"("externalId");
