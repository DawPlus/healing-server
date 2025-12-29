/*
  Warnings:

  - You are about to drop the column `category_id` on the `program_new_menus_locations` table. All the data in the column will be lost.
  - You are about to drop the `program_new_menus_location_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `program_new_menus_locations` DROP FOREIGN KEY `program_new_menus_locations_category_id_fkey`;

-- AlterTable
ALTER TABLE `program_new_menus_locations` DROP COLUMN `category_id`;

-- DropTable
DROP TABLE `program_new_menus_location_categories`;
