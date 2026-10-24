/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "barcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_barcode_key" ON "Medicine"("barcode");
