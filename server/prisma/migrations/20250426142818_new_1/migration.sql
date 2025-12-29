-- CreateTable
CREATE TABLE `participant_rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `room_type` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `participant_rooms_page1_id_idx`(`page1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participant_meals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `meal_type` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `participant_meals_page1_id_idx`(`page1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
