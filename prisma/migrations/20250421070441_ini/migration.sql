-- CreateTable
CREATE TABLE `Page1` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservation_status` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `group_name` VARCHAR(191) NULL,
    `customer_name` VARCHAR(191) NULL,
    `total_count` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `mobile_phone` VARCHAR(191) NULL,
    `landline_phone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `create_dtm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `create_user` VARCHAR(191) NOT NULL,
    `update_dtm` DATETIME(3) NOT NULL,
    `update_user` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page3` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `reservation_status` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `company_name` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `contact_person` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `participants_count` INTEGER NULL,
    `room_count` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `purpose` VARCHAR(191) NULL,
    `catering_required` BOOLEAN NOT NULL DEFAULT false,
    `special_requirements` TEXT NULL,
    `room_selections` JSON NULL,
    `meal_plans` JSON NULL,
    `place_reservations` JSON NULL,
    `create_dtm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `create_user` VARCHAR(191) NOT NULL,
    `update_dtm` DATETIME(3) NOT NULL,
    `update_user` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Page3_page1_id_key`(`page1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Page3` ADD CONSTRAINT `Page3_page1_id_fkey` FOREIGN KEY (`page1_id`) REFERENCES `Page1`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
