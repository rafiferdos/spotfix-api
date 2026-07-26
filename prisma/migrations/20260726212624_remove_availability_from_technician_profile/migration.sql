/*
  Warnings:

  - You are about to drop the column `availability` on the `technician_profiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "technician_profiles_availability_idx";

-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "availability";
