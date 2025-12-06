-- CreateTable
CREATE TABLE `page2_reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `male_count` INTEGER NULL DEFAULT 0,
    `female_count` INTEGER NULL DEFAULT 0,
    `total_count` INTEGER NULL DEFAULT 0,
    `male_leader_count` INTEGER NULL DEFAULT 0,
    `female_leader_count` INTEGER NULL DEFAULT 0,
    `total_leader_count` INTEGER NULL DEFAULT 0,
    `is_mou` BOOLEAN NULL DEFAULT false,
    `org_nature` VARCHAR(191) NULL,
    `part_type` VARCHAR(191) NULL,
    `age_type` VARCHAR(191) NULL,
    `part_form` VARCHAR(191) NULL,
    `service_type` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page2_programs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservation_id` INTEGER NOT NULL,
    `category` VARCHAR(191) NULL,
    `category_name` VARCHAR(191) NULL,
    `program` VARCHAR(191) NULL,
    `program_name` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `start_time` VARCHAR(191) NULL,
    `end_time` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `place` VARCHAR(191) NULL,
    `place_name` VARCHAR(191) NULL,
    `instructor` VARCHAR(191) NULL,
    `instructor_name` VARCHAR(191) NULL,
    `assistant` VARCHAR(191) NULL,
    `assistant_name` VARCHAR(191) NULL,
    `helper` VARCHAR(191) NULL,
    `helper_name` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page2_reservations` ADD CONSTRAINT `page2_reservations_page1_id_fkey` FOREIGN KEY (`page1_id`) REFERENCES `Page1`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page2_programs` ADD CONSTRAINT `page2_programs_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `page2_reservations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
