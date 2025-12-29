-- AlterTable
ALTER TABLE `income_items` ADD COLUMN `discount_rate` DOUBLE NULL;

-- AlterTable
ALTER TABLE `participant_expenses` ADD COLUMN `discount_rate` DOUBLE NULL;

-- AlterTable
ALTER TABLE `teacher_expenses` ADD COLUMN `discount_rate` DOUBLE NULL;

-- CreateTable
CREATE TABLE `program_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `program_form_id` INTEGER NOT NULL,
    `program_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL DEFAULT '참여자',
    `score1` VARCHAR(191) NULL,
    `score2` VARCHAR(191) NULL,
    `score3` VARCHAR(191) NULL,
    `score4` VARCHAR(191) NULL,
    `score5` VARCHAR(191) NULL,
    `score6` VARCHAR(191) NULL,
    `score7` VARCHAR(191) NULL,
    `score8` VARCHAR(191) NULL,
    `score9` VARCHAR(191) NULL,
    `score10` VARCHAR(191) NULL,
    `score11` VARCHAR(191) NULL,
    `score12` VARCHAR(191) NULL,
    `expectation` TEXT NULL,
    `improvement` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `program_form_entries_program_form_id_idx`(`program_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `program_form_entries` ADD CONSTRAINT `program_form_entries_program_form_id_fkey` FOREIGN KEY (`program_form_id`) REFERENCES `program_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
