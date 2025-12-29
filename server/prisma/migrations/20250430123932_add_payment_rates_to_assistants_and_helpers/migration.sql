-- AlterTable
ALTER TABLE `program_new_menus_assistant_instructors` ADD COLUMN `payment_rate` INTEGER NULL DEFAULT 60000;

-- AlterTable
ALTER TABLE `program_new_menus_helpers` ADD COLUMN `payment_rate` INTEGER NULL DEFAULT 50000;
