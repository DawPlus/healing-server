-- AlterTable
ALTER TABLE `project4_expenses` ADD COLUMN `actual_amount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `actual_price` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `project4_materials` ADD COLUMN `actual_amount` INTEGER NULL DEFAULT 0;
