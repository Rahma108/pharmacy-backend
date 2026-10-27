-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "activeIngredient" TEXT,
ADD COLUMN     "dosageForm" TEXT,
ADD COLUMN     "rxNormCui" TEXT,
ADD COLUMN     "strength" TEXT;

-- CreateIndex
CREATE INDEX "Medicine_activeIngredient_idx" ON "Medicine"("activeIngredient");
