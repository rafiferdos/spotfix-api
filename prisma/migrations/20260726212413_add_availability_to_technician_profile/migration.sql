-- AlterTable
ALTER TABLE "technician_profiles" ADD COLUMN     "availabilitySlots" TEXT[] DEFAULT ARRAY[]::TEXT[];
