-- AlterTable
ALTER TABLE `page2_reservations` ADD COLUMN `adult_count` INTEGER NULL DEFAULT 0,
    ADD COLUMN `age_group_total` INTEGER NULL DEFAULT 0,
    ADD COLUMN `elderly_count` INTEGER NULL DEFAULT 0,
    ADD COLUMN `elementary_count` INTEGER NULL DEFAULT 0,
    ADD COLUMN `high_count` INTEGER NULL DEFAULT 0,
    ADD COLUMN `infant_count` INTEGER NULL DEFAULT 0,
    ADD COLUMN `middle_count` INTEGER NULL DEFAULT 0;
