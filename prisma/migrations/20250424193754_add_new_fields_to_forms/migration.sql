-- AlterTable
ALTER TABLE `counsel_therapy_forms` ADD COLUMN `agency_id` INTEGER NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `past_stress_experience` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `healing_forms` ADD COLUMN `agency_id` INTEGER NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `past_stress_experience` VARCHAR(191) NULL,
    ADD COLUMN `pv` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `prevent_forms` ADD COLUMN `agency_id` INTEGER NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `past_stress_experience` VARCHAR(191) NULL;
