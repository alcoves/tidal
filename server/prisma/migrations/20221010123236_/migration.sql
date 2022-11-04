-- AlterTable
ALTER TABLE "Transcode" ADD COLUMN     "playbackId" TEXT;

-- CreateTable
CREATE TABLE "Playback" (
    "id" TEXT NOT NULL,
    "playbackUri" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transcode" ADD CONSTRAINT "Transcode_playbackId_fkey" FOREIGN KEY ("playbackId") REFERENCES "Playback"("id") ON DELETE SET NULL ON UPDATE CASCADE;
