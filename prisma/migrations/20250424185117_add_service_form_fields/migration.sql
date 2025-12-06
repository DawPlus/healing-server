-- AlterTable
ALTER TABLE `program_form_entries` ADD COLUMN `type` VARCHAR(191) NULL DEFAULT '참여자';

-- AlterTable
ALTER TABLE `program_forms` ADD COLUMN `agency_id` INTEGER NULL,
    ADD COLUMN `place` VARCHAR(191) NULL,
    ADD COLUMN `program_category_id` INTEGER NULL,
    ADD COLUMN `program_id` INTEGER NULL,
    ADD COLUMN `teacher_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `service_forms` ADD COLUMN `agency_id` INTEGER NULL;
