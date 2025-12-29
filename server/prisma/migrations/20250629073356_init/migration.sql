/*
  Warnings:

  - You are about to drop the column `past_experience` on the `prevent_gambling_forms` table. All the data in the column will be lost.
  - You are about to drop the column `prevent_seq` on the `prevent_gambling_forms` table. All the data in the column will be lost.
  - You are about to drop the column `session1` on the `prevent_gambling_forms` table. All the data in the column will be lost.
  - You are about to drop the column `session2` on the `prevent_gambling_forms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `prevent_gambling_forms` DROP COLUMN `past_experience`,
    DROP COLUMN `prevent_seq`,
    DROP COLUMN `session1`,
    DROP COLUMN `session2`,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `past_stress_experience` VARCHAR(191) NULL,
    ADD COLUMN `prevent_gambling_seq` INTEGER NULL;
