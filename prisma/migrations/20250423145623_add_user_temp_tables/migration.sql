-- CreateTable
CREATE TABLE `user_temp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seq` VARCHAR(50) NULL,
    `name` VARCHAR(100) NULL,
    `sex` VARCHAR(20) NULL,
    `age` VARCHAR(20) NULL,
    `residence` VARCHAR(50) NULL,
    `job` VARCHAR(50) NULL,
    `agency` VARCHAR(100) NOT NULL,
    `openday` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_temp_agency_openday_idx`(`agency`, `openday`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_temp_agency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(100) NOT NULL,
    `openday` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_temp_agency_agency_openday_key`(`agency`, `openday`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
