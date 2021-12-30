-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('CREATED', 'PROCESSING', 'READY', 'ERROR');

-- CreateTable
CREATE TABLE "Video" (
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

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_externalId_key" ON "Video"("externalId");
