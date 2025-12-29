-- CreateTable
CREATE TABLE `service_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_form_id` INTEGER NOT NULL,
    `service_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
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
    `facility_opinion` TEXT NULL,
    `score11` VARCHAR(191) NULL,
    `score12` VARCHAR(191) NULL,
    `score13` VARCHAR(191) NULL,
    `score14` VARCHAR(191) NULL,
    `score15` VARCHAR(191) NULL,
    `score16` VARCHAR(191) NULL,
    `operation_opinion` TEXT NULL,
    `score17` VARCHAR(191) NULL,
    `score18` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `service_form_entries_service_form_id_idx`(`service_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `program_form_id` INTEGER NOT NULL,
    `program_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
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

-- CreateTable
CREATE TABLE `counsel_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `counsel_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `counsel_form_id` INTEGER NOT NULL,
    `counsel_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
    `score1` VARCHAR(191) NULL,
    `score2` VARCHAR(191) NULL,
    `score3` VARCHAR(191) NULL,
    `score4` VARCHAR(191) NULL,
    `score5` VARCHAR(191) NULL,
    `score6` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `counsel_form_entries_counsel_form_id_idx`(`counsel_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prevent_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prevent_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prevent_form_id` INTEGER NOT NULL,
    `prevent_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
    `score1` VARCHAR(191) NULL,
    `score2` VARCHAR(191) NULL,
    `score3` VARCHAR(191) NULL,
    `score4` VARCHAR(191) NULL,
    `score5` VARCHAR(191) NULL,
    `score6` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `prevent_form_entries_prevent_form_id_idx`(`prevent_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healing_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `healing_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `healing_form_id` INTEGER NOT NULL,
    `healing_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
    `score1` VARCHAR(191) NULL,
    `score2` VARCHAR(191) NULL,
    `score3` VARCHAR(191) NULL,
    `score4` VARCHAR(191) NULL,
    `score5` VARCHAR(191) NULL,
    `score6` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `healing_form_entries_healing_form_id_idx`(`healing_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hrv_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hrv_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hrv_form_id` INTEGER NOT NULL,
    `hrv_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
    `stress_index_pre` VARCHAR(191) NULL,
    `stress_index_post` VARCHAR(191) NULL,
    `heart_rate_pre` VARCHAR(191) NULL,
    `heart_rate_post` VARCHAR(191) NULL,
    `sdnn_pre` VARCHAR(191) NULL,
    `sdnn_post` VARCHAR(191) NULL,
    `rmssd_pre` VARCHAR(191) NULL,
    `rmssd_post` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hrv_form_entries_hrv_form_id_idx`(`hrv_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vibra_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vibra_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vibra_form_id` INTEGER NOT NULL,
    `vibra_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
    `physical_pre` VARCHAR(191) NULL,
    `physical_post` VARCHAR(191) NULL,
    `emotional_pre` VARCHAR(191) NULL,
    `emotional_post` VARCHAR(191) NULL,
    `mental_pre` VARCHAR(191) NULL,
    `mental_post` VARCHAR(191) NULL,
    `spiritual_pre` VARCHAR(191) NULL,
    `spiritual_post` VARCHAR(191) NULL,
    `total_pre` VARCHAR(191) NULL,
    `total_post` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vibra_form_entries_vibra_form_id_idx`(`vibra_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_form_entries` ADD CONSTRAINT `service_form_entries_service_form_id_fkey` FOREIGN KEY (`service_form_id`) REFERENCES `service_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_form_entries` ADD CONSTRAINT `program_form_entries_program_form_id_fkey` FOREIGN KEY (`program_form_id`) REFERENCES `program_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `counsel_form_entries` ADD CONSTRAINT `counsel_form_entries_counsel_form_id_fkey` FOREIGN KEY (`counsel_form_id`) REFERENCES `counsel_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prevent_form_entries` ADD CONSTRAINT `prevent_form_entries_prevent_form_id_fkey` FOREIGN KEY (`prevent_form_id`) REFERENCES `prevent_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `healing_form_entries` ADD CONSTRAINT `healing_form_entries_healing_form_id_fkey` FOREIGN KEY (`healing_form_id`) REFERENCES `healing_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hrv_form_entries` ADD CONSTRAINT `hrv_form_entries_hrv_form_id_fkey` FOREIGN KEY (`hrv_form_id`) REFERENCES `hrv_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vibra_form_entries` ADD CONSTRAINT `vibra_form_entries_vibra_form_id_fkey` FOREIGN KEY (`vibra_form_id`) REFERENCES `vibra_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
