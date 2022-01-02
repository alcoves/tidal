-- CreateEnum
CREATE TYPE "RenditionStatus" AS ENUM ('CREATED', 'TRANSCODING', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "Rendition" (
    "id" SERIAL NOT NULL,
    "resolution" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT E'CREATED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "videoId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rendition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rendition" ADD CONSTRAINT "Rendition_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
