-- CreateTable
CREATE TABLE `location_manager` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `reservation_date` DATETIME(3) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `organization_name` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'reserved',
    `purpose` VARCHAR(191) NULL,
    `attendees` INTEGER NOT NULL DEFAULT 1,
    `price` INTEGER NOT NULL DEFAULT 0,
    `total_price` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `location_manager_page1_id_idx`(`page1_id`),
    INDEX `location_manager_location_id_idx`(`location_id`),
    INDEX `location_manager_reservation_date_idx`(`reservation_date`),
    INDEX `location_manager_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `location_name` VARCHAR(191) NULL,
    `reservation_date` DATETIME(3) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `location_reservation_page1_id_idx`(`page1_id`),
    INDEX `location_reservation_location_id_idx`(`location_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
