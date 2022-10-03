-- CreateTable
CREATE TABLE "Transcode" (
    "id" TEXT NOT NULL,
    "s3Uri" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '',
    "status" "Status" NOT NULL DEFAULT 'PROCESSING',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "Transcode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transcode" ADD CONSTRAINT "Transcode_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
