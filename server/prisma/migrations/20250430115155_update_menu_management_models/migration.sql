/*
  Warnings:

  - You are about to drop the column `category` on the `program_new_menus_instructors` table. All the data in the column will be lost.
  - You are about to drop the column `facilities` on the `program_new_menus_rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `program_new_menus_assistant_instructors` ADD COLUMN `bank_info` VARCHAR(255) NULL,
    ADD COLUMN `payment` INTEGER NULL DEFAULT 0,
    ADD COLUMN `payment_rate` INTEGER NULL DEFAULT 60000;

-- AlterTable
ALTER TABLE `program_new_menus_helpers` ADD COLUMN `bank_info` VARCHAR(255) NULL,
    ADD COLUMN `payment` INTEGER NULL DEFAULT 0,
    ADD COLUMN `payment_rate` INTEGER NULL DEFAULT 50000;

-- AlterTable
ALTER TABLE `program_new_menus_instructors` DROP COLUMN `category`,
    MODIFY `tax_rate` DOUBLE NULL DEFAULT 0.088,
    MODIFY `type` VARCHAR(50) NULL DEFAULT '기타소득';

-- AlterTable
ALTER TABLE `program_new_menus_rooms` DROP COLUMN `facilities`;
