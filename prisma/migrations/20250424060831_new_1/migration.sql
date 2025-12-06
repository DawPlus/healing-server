-- AlterTable
ALTER TABLE `program_new_menus_instructors` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `bank_info` VARCHAR(255) NULL,
    ADD COLUMN `category` VARCHAR(50) NULL DEFAULT '강사',
    ADD COLUMN `contact` VARCHAR(100) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `payment_rate` INTEGER NULL DEFAULT 200000,
    ADD COLUMN `tax_rate` DOUBLE NULL DEFAULT 0.033,
    ADD COLUMN `type` VARCHAR(50) NULL DEFAULT '일반';
