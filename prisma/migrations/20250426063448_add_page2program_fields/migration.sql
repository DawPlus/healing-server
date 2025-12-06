-- AlterTable
ALTER TABLE `page2_programs` ADD COLUMN `is_multi` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `multi1_name` VARCHAR(191) NULL,
    ADD COLUMN `multi2_name` VARCHAR(191) NULL,
    ADD COLUMN `participants` INTEGER NULL DEFAULT 0;
