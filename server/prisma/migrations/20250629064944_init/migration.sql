/*
  Warnings:

  - You are about to drop the column `name` on the `prevent_gambling_forms` table. All the data in the column will be lost.
  - You are about to drop the column `past_stress_experience` on the `prevent_gambling_forms` table. All the data in the column will be lost.
  - You are about to drop the column `prevent_gambling_seq` on the `prevent_gambling_forms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `prevent_gambling_forms` DROP COLUMN `name`,
    DROP COLUMN `past_stress_experience`,
    DROP COLUMN `prevent_gambling_seq`,
    ADD COLUMN `past_experience` VARCHAR(191) NULL,
    ADD COLUMN `prevent_seq` INTEGER NULL,
    ADD COLUMN `session1` VARCHAR(191) NULL,
    ADD COLUMN `session2` VARCHAR(191) NULL;
