-- CreateTable
CREATE TABLE `room_availability` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `check_in_date` DATETIME(3) NOT NULL,
    `check_out_date` DATETIME(3) NOT NULL,
    `organization_name` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'reserved',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `room_availability_page1_id_idx`(`page1_id`),
    INDEX `room_availability_room_id_idx`(`room_id`),
    INDEX `room_availability_check_in_date_check_out_date_idx`(`check_in_date`, `check_out_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
