-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `user_pwd` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `create_dtm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_dtm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
