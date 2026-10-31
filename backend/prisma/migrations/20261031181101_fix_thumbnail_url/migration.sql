/*
  Warnings:

  - You are about to drop the column `thumbnaiUrl` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "thumbnaiUrl",
ADD COLUMN     "thumbnailUrl" TEXT;
