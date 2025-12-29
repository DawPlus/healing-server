/*
  Warnings:

  - You are about to drop the column `bank_info` on the `program_new_menus_assistant_instructors` table. All the data in the column will be lost.
  - You are about to drop the column `payment` on the `program_new_menus_assistant_instructors` table. All the data in the column will be lost.
  - You are about to drop the column `payment_rate` on the `program_new_menus_assistant_instructors` table. All the data in the column will be lost.
  - You are about to drop the column `bank_info` on the `program_new_menus_helpers` table. All the data in the column will be lost.
  - You are about to drop the column `payment` on the `program_new_menus_helpers` table. All the data in the column will be lost.
  - You are about to drop the column `payment_rate` on the `program_new_menus_helpers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `program_new_menus_assistant_instructors` DROP COLUMN `bank_info`,
    DROP COLUMN `payment`,
    DROP COLUMN `payment_rate`;

-- AlterTable
ALTER TABLE `program_new_menus_helpers` DROP COLUMN `bank_info`,
    DROP COLUMN `payment`,
    DROP COLUMN `payment_rate`;

-- AlterTable
ALTER TABLE `program_new_menus_instructors` ADD COLUMN `category` VARCHAR(50) NULL DEFAULT '강사',
    MODIFY `tax_rate` DOUBLE NULL DEFAULT 0.033,
    MODIFY `type` VARCHAR(50) NULL DEFAULT '일반';

-- AlterTable
ALTER TABLE `program_new_menus_locations` ADD COLUMN `category_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `program_new_menus_rooms` ADD COLUMN `facilities` TEXT NULL;

-- CreateTable
CREATE TABLE `program_new_menus_location_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `display_order` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `program_new_menus_locations_category_id_idx` ON `program_new_menus_locations`(`category_id`);

-- AddForeignKey
ALTER TABLE `program_new_menus_locations` ADD CONSTRAINT `program_new_menus_locations_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `program_new_menus_location_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
