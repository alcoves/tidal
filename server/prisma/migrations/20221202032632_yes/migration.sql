/*
  Warnings:

  - Added the required column `location` to the `VideoPlayback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoPlayback" ADD COLUMN     "location" TEXT NOT NULL;
