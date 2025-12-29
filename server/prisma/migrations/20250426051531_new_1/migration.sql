/*
  Warnings:

  - You are about to drop the column `environment_area1` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `environment_area1_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `environment_area2` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `environment_area2_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `environment_area3` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `environment_area3_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `facility_area1` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `facility_area1_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `facility_area2` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `facility_area2_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `facility_area3` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `facility_area3_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `forest_usage1` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `forest_usage1_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `forest_usage2` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `forest_usage2_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `forest_usage3` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `forest_usage3_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `program_area1` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `program_area1_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `program_area2` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `program_area2_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `program_area3` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `program_area3_note` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `suggestion_area1` on the `page_final` table. All the data in the column will be lost.
  - You are about to drop the column `suggestion_area1_note` on the `page_final` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `page_final` DROP COLUMN `environment_area1`,
    DROP COLUMN `environment_area1_note`,
    DROP COLUMN `environment_area2`,
    DROP COLUMN `environment_area2_note`,
    DROP COLUMN `environment_area3`,
    DROP COLUMN `environment_area3_note`,
    DROP COLUMN `facility_area1`,
    DROP COLUMN `facility_area1_note`,
    DROP COLUMN `facility_area2`,
    DROP COLUMN `facility_area2_note`,
    DROP COLUMN `facility_area3`,
    DROP COLUMN `facility_area3_note`,
    DROP COLUMN `forest_usage1`,
    DROP COLUMN `forest_usage1_note`,
    DROP COLUMN `forest_usage2`,
    DROP COLUMN `forest_usage2_note`,
    DROP COLUMN `forest_usage3`,
    DROP COLUMN `forest_usage3_note`,
    DROP COLUMN `program_area1`,
    DROP COLUMN `program_area1_note`,
    DROP COLUMN `program_area2`,
    DROP COLUMN `program_area2_note`,
    DROP COLUMN `program_area3`,
    DROP COLUMN `program_area3_note`,
    DROP COLUMN `suggestion_area1`,
    DROP COLUMN `suggestion_area1_note`,
    ADD COLUMN `discount_notes` VARCHAR(191) NULL,
    ADD COLUMN `discount_rate` DOUBLE NULL;

-- CreateTable
CREATE TABLE `teacher_expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_final_id` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `details` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `is_planned` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `teacher_expenses_page_final_id_idx`(`page_final_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participant_expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_final_id` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `details` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `is_planned` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `participant_expenses_page_final_id_idx`(`page_final_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `income_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_final_id` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `details` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `income_items_page_final_id_idx`(`page_final_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `teacher_expenses` ADD CONSTRAINT `teacher_expenses_page_final_id_fkey` FOREIGN KEY (`page_final_id`) REFERENCES `page_final`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participant_expenses` ADD CONSTRAINT `participant_expenses_page_final_id_fkey` FOREIGN KEY (`page_final_id`) REFERENCES `page_final`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `income_items` ADD CONSTRAINT `income_items_page_final_id_fkey` FOREIGN KEY (`page_final_id`) REFERENCES `page_final`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
